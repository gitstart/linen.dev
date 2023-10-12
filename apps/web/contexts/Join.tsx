import Modal from '@linen/ui/Modal';
import type { SessionType } from 'services/session';
import { getSession } from '@linen/auth-client/client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import SignUp from 'pages/signup';
import SignIn from 'pages/signin';
import {
  AuthFlow,
  StartSignUpFn,
  StartSignUpProps,
  SignInMode,
} from '@linen/types';
import LinenLogo from '@linen/ui/LinenLogo';

const Context = createContext<{
  startSignUp: StartSignUpFn;
}>({
  startSignUp: () => {},
});

type Props = {
  children: React.ReactNode;
};

export const JoinContext = ({ children }: Props) => {
  const [open, setOpen] = useState(false);
  const [communityId, setCommunityId] = useState<string>();
  const [flow, setFlow] = useState<AuthFlow>('signup');
  const [mode, setMode] = useState<SignInMode>('magic');

  const [callbackUrl, setCallbackUrl] = useState<string>();

  useEffect(() => {
    if (!callbackUrl) {
      setCallbackUrl(window.location.href);
    }
  }, [callbackUrl]);

  async function join({ communityId }: { communityId: string }) {
    return await fetch('/api/invites/join-button', {
      method: 'post',
      body: JSON.stringify({
        communityId,
      }),
    });
  }

  const startSignUp = async (props: StartSignUpProps) => {
    setFlow(props.flow || 'signup');
    setCommunityId(props.communityId);
    setCallbackUrl(props.redirectUrl || window.location.href);
    const session = await getSession();
    if (session) {
      const res = await join({ communityId: props.communityId });
      if (res.ok) {
        window.location.replace(props.redirectUrl || window.location.href);
        return;
      }
    }
    setOpen(!open);
  };

  const onSuccessfulSignIn = async () => {
    const session = await getSession();
    if (session && communityId) {
      const res = await join({ communityId });
      if (res.ok) {
        window.location.replace(window.location.href);
        return;
      }
    }
    setOpen(false);
  };

  const onCloseModal = () => {
    setOpen(false);
  };

  const mapText = {
    signup: 'Sign up',
    signin: 'Log in',
  };

  return (
    <Context.Provider value={{ startSignUp }}>
      <Modal open={open} close={onCloseModal}>
        <div className="text-center">
          <LinenLogo />

          <p className="text-sm text-gray-500">
            {mapText[flow]} to join the community and start to chat
          </p>
        </div>
        <div style={{ padding: '0.5rem' }}></div>
        {flow === 'signup' && (
          <SignUp
            mode={mode}
            withLayout={false}
            callbackUrl={callbackUrl}
            showSignIn={(mode) => {
              setFlow('signin');
              setMode(mode);
            }}
            onSignIn={onSuccessfulSignIn}
            state={communityId}
            // email, error,
          />
        )}
        {flow === 'signin' && (
          <SignIn
            mode={mode}
            withLayout={false}
            callbackUrl={callbackUrl}
            showSignUp={(mode) => {
              setFlow('signup');
              setMode(mode);
            }}
            onSignIn={onSuccessfulSignIn}
            state={communityId}
            // email, error
          />
        )}
      </Modal>
      {children}
    </Context.Provider>
  );
};

export const useJoinContext = () => useContext(Context);
