import NavBar from '@linen/ui/NavBar';
import useMode from '@linen/hooks/mode';
import InternalLink from '../InternalLink';
import Image from '../Image';
import {
  mockedComponent,
  mockedRouterAsPath,
  mockedFunction,
} from '../../mock';
import { useLinenStore, shallow } from '../../store';
import { api } from '../../fetcher';
import Loading from '../Loading';
import customUsePath from '../../hooks/usePath';
import { getHomeUrl } from '../../di';

export default function NavLeftBar() {
  const { mode } = useMode();
  const {
    channels,
    channelName,
    permissions,
    currentCommunity,
    settings,
    communityName,
    communities,
    dms,
  } = useLinenStore(
    (state) => ({
      channels: state.channels,
      channelName: state.channelName,
      permissions: state.permissions,
      currentCommunity: state.currentCommunity,
      settings: state.settings,
      communityName: state.communityName,
      communities: state.communities,
      dms: state.dms,
    }),
    shallow
  );

  if (
    !settings ||
    !currentCommunity ||
    !channelName ||
    !permissions ||
    !communityName
  )
    return <Loading />;

  return (
    <NavBar
      {...{
        currentCommunity,
        communities,
        post: api.post,
        put: api.put,
        mode,
        channelName,
        permissions,
        channels,
        dms,
        archiveChannel: api.archiveChannel,
        // components injection
        Image,
        Link: InternalLink({ communityName }),
        getHomeUrl,
        usePath: customUsePath({ communityName }),
        // TODO:
        NewChannelModal: mockedComponent,
        NewCommunityModal: mockedComponent,
        NewDmModal: mockedComponent,
        notify: mockedFunction,
        routerAsPath: mockedRouterAsPath,
        onDrop: mockedFunction,
      }}
    />
  );
}
