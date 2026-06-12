import { createContext, useContext } from 'react'
import { noop } from '@gorgias/toolkit'
import type { SelfServiceChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'

export type ConnectedChannelsContextType = {
    channels: SelfServiceChannel[]
    channel: SelfServiceChannel | undefined
    onChannelChange: (channel: SelfServiceChannel | undefined) => void
}

const ConnectedChannelsContext = createContext<ConnectedChannelsContextType>({
    channels: [],
    channel: undefined,
    onChannelChange: noop,
})

export const useConnectedChannelsContext = () =>
    useContext(ConnectedChannelsContext)

export { ConnectedChannelsContext }
