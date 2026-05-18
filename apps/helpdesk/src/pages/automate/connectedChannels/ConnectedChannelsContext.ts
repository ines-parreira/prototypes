import { createContext, useContext } from 'react'

import _noop from 'lodash/noop'

import type { SelfServiceChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'

export type ConnectedChannelsContextType = {
    channels: SelfServiceChannel[]
    channel: SelfServiceChannel | undefined
    onChannelChange: (channel: SelfServiceChannel | undefined) => void
}

const ConnectedChannelsContext = createContext<ConnectedChannelsContextType>({
    channels: [],
    channel: undefined,
    onChannelChange: _noop,
})

export const useConnectedChannelsContext = () =>
    useContext(ConnectedChannelsContext)

export default ConnectedChannelsContext
