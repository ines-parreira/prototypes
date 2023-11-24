import {useMemo} from 'react'

import useSelfServiceHelpCenterChannels, {
    SelfServiceHelpCenterChannel,
} from './useSelfServiceHelpCenterChannels'
import useSelfServiceChatChannels, {
    SelfServiceChatChannel,
} from './useSelfServiceChatChannels'
import useSelfServiceStandaloneContactFormChannels, {
    SelfServiceStandaloneContactFormChannel,
} from './useSelfServiceStandaloneContactFormChannels'

export type SelfServiceChannel =
    | SelfServiceHelpCenterChannel
    | SelfServiceChatChannel
    | SelfServiceStandaloneContactFormChannel

export type SelfServiceChannelType = SelfServiceChannel['type']

const useSelfServiceChannels = (shopType: string, shopName: string) => {
    const chatIntegrations = useSelfServiceChatChannels(shopType, shopName)
    const helpCenters = useSelfServiceHelpCenterChannels(shopType, shopName)
    const standaloneContactForms = useSelfServiceStandaloneContactFormChannels(
        shopType,
        shopName
    )

    return useMemo(() => {
        return [...chatIntegrations, ...helpCenters, ...standaloneContactForms]
    }, [chatIntegrations, helpCenters, standaloneContactForms])
}

export default useSelfServiceChannels
