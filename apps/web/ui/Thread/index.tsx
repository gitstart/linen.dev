import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import Header from './Header';
import Summary from './Summary';
import Messages from './Messages';
import {
  onResolve,
  Permissions,
  SerializedAccount,
  SerializedMessage,
  SerializedThread,
  SerializedUser,
  Settings,
  ThreadState,
  UploadedFile,
} from '@linen/types';
import { scrollToBottom } from '@linen/utilities/scroll';
import styles from './index.module.scss';
import { getFormData } from '@linen/utilities/files';
import PoweredByLinen from '@/PoweredByLinen';
import EditMessageModal from '@/EditMessageModal';
import type { ApiClient } from '@linen/api-client';

interface Props {
  thread: SerializedThread;
  channelId: string;
  channelName: string;
  currentCommunity: SerializedAccount;
  isBot?: boolean;
  isSubDomainRouting: boolean;
  settings: Settings;
  permissions: Permissions;
  currentUser: SerializedUser | null;
  token: string | null;
  expanded?: boolean;
  sendMessage({
    message,
    files,
    channelId,
    threadId,
  }: {
    message: string;
    files: UploadedFile[];
    channelId: string;
    threadId: string;
  }): Promise<void>;
  updateThread({ state, title }: { state?: ThreadState; title?: string }): void;
  onClose?(): void;
  onExpandClick?(): void;
  onDelete?(messageId: string): void;
  onEdit?(threadId: string, messageId: string): void;
  onSend?(): void;
  onMessage(
    threadId: string,
    message: SerializedMessage,
    messageId: string,
    imitationId: string
  ): void;
  onMount?(): void;
  onReaction?({
    threadId,
    messageId,
    type,
    active,
  }: {
    threadId: string;
    messageId: string;
    type: string;
    active: boolean;
  }): void;
  onResolution?: onResolve;
  editMessage?({
    id,
    body,
  }: {
    id: string;
    body: string;
  }): Promise<SerializedMessage | void>;
  useUsersContext(): any;
  fetchMentions(term?: string | undefined): Promise<SerializedUser[]>;
  api: ApiClient;
  breadcrumb?: React.ReactNode;
  sidebar?: boolean;
  chat?: boolean;
  classContainer?: string;
  activeUsers: string[];
}

enum ModalView {
  NONE,
  EDIT_MESSAGE_MODAL,
}

function Thread({
  thread,
  channelId,
  channelName,
  currentCommunity,
  isBot,
  isSubDomainRouting,
  settings,
  permissions,
  currentUser,
  token,
  expanded,
  sendMessage,
  updateThread,
  onClose,
  onExpandClick,
  onDelete,
  onSend,
  onMount,
  onReaction,
  onMessage,
  onResolution,
  editMessage,
  useUsersContext,
  api,
  fetchMentions,
  breadcrumb,
  chat,
  sidebar,
  activeUsers,
  ...props
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const { id, state, viewCount, incrementId } = thread;
  const [modal, setModal] = useState<ModalView>(ModalView.NONE);
  const [editedMessage, setEditedMessage] = useState<SerializedMessage>();
  const [isUserTyping, setUserTyping] = useState(false);

  const currentChannel = thread.channel!;

  const handleScroll = () =>
    setTimeout(() => scrollToBottom(ref.current as HTMLDivElement), 0);

  useEffect(() => {
    onMount?.();
  }, []);

  useEffect(() => {
    if (incrementId) {
      api.threadIncrementView({ incrementId });
      if (currentUser?.id) {
        api.notificationsMark({ threadId: thread.id });
      }
    }
  }, []);

  function showEditMessageModal(threadId: string, messageId: string) {
    const message = thread.messages.find(
      ({ id }: SerializedMessage) => id === messageId
    );
    setEditedMessage(message);
    setModal(ModalView.EDIT_MESSAGE_MODAL);
  }

  function isThreadCreator(
    currentUser: SerializedUser | null,
    thread: SerializedThread
  ): boolean {
    const creator = thread.messages[0].author;
    if (!currentUser || !creator) {
      return false;
    }
    return currentUser.id === creator.id;
  }

  async function uploadFiles(files: File[]) {
    setProgress(0);
    setUploading(true);
    setUploads([]);
    const data = await getFormData(files);
    return api
      .upload(
        { communityId: settings.communityId, data, type: 'attachments' },
        {
          onUploadProgress: (progressEvent: ProgressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      )
      .then(({ files }) => {
        setUploading(false);
        setUploads(files);
      })
      .catch((response) => {
        setUploading(false);
        return response;
      });
  }

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const files = Array.from(event.dataTransfer.files || []);
    if (files.length > 0) {
      uploadFiles(files);
    }
  };

  const manage = permissions.manage || isThreadCreator(currentUser, thread);
  const views = viewCount + 1;

  return (
    <>
      <div
        className={classNames(
          styles.container,
          {
            [styles.expanded]: expanded,
          },
          props.classContainer
        )}
        ref={ref}
        onDrop={onDrop}
      >
        <Header
          thread={thread}
          onClose={onClose}
          expanded={expanded}
          onExpandClick={onExpandClick}
          onSetTitle={(title) => updateThread({ title })}
          manage={manage}
          breadcrumb={breadcrumb}
          sidebar={sidebar}
        />
        <Summary thread={thread} />
        <div className={styles.thread}>
          <Messages
            thread={thread}
            permissions={permissions}
            isBot={isBot}
            isSubDomainRouting={isSubDomainRouting}
            currentUser={currentUser}
            activeUsers={activeUsers}
            settings={settings}
            onDelete={onDelete}
            onEdit={editMessage ? showEditMessageModal : undefined}
            onReaction={onReaction}
            onLoad={handleScroll}
            onResolution={onResolution}
          />

          <div className={styles.info}>
            <div className={styles.count}>
              <span className={styles.badge}>
                {views > 1 && (
                  <div className={styles.count}>
                    {views} {views === 1 ? 'View' : 'Views'}
                  </div>
                )}
              </span>
            </div>
          </div>
        </div>

        {expanded && !currentUser && (
          <div className={styles.footer}>
            <PoweredByLinen />
          </div>
        )}
      </div>
      {currentUser && editMessage && editedMessage && (
        <EditMessageModal
          api={api}
          communityId={settings.communityId}
          currentUser={currentUser}
          open={modal === ModalView.EDIT_MESSAGE_MODAL}
          close={() => {
            setEditedMessage(undefined);
            setModal(ModalView.NONE);
          }}
          onSend={({ message }) => {
            setModal(ModalView.NONE);
            return editMessage({
              id: editedMessage.id,
              body: message,
            });
          }}
          currentMessage={editedMessage}
          progress={progress}
          uploading={uploading}
          uploads={uploads}
          uploadFiles={uploadFiles}
        />
      )}
    </>
  );
}

Thread.defaultProps = {
  chat: true,
};

export default Thread;
