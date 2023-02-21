import {useMemo} from 'react'

import useSelfServiceHelpCenterChannels, {
    SelfServiceHelpCenterChannel,
} from './useSelfServiceHelpCenterChannels'
import useSelfServiceChatChannels, {
    SelfServiceChatChannel,
} from './useSelfServiceChatChannels'

export type SelfServiceChannel =
    | SelfServiceHelpCenterChannel
    | SelfServiceChatChannel

const useSelfServiceChannels = (shopType: string, shopName: string) => {
    const chatIntegrations = useSelfServiceChatChannels(shopType, shopName)
    const helpCenters = useSelfServiceHelpCenterChannels(shopType, shopName)

    return useMemo(() => {
        return [...chatIntegrations, ...helpCenters]
    }, [chatIntegrations, helpCenters])
}

export default useSelfServiceChannels
