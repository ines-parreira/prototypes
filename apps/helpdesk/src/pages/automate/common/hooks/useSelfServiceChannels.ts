import { useMemo } from 'react'

import { TicketChannel } from 'business/types/ticket'

import type { SelfServiceChatChannel } from './useSelfServiceChatChannels'
import useSelfServiceChatChannels from './useSelfServiceChatChannels'
import type { SelfServiceHelpCenterChannel } from './useSelfServiceHelpCenterChannels'
import useSelfServiceHelpCenterChannels from './useSelfServiceHelpCenterChannels'
import type { SelfServiceStandaloneContactFormChannel } from './useSelfServiceStandaloneContactFormChannels'
import useSelfServiceStandaloneContactFormChannels from './useSelfServiceStandaloneContactFormChannels'

export type SelfServiceChannel =
    | SelfServiceHelpCenterChannel
    | SelfServiceChatChannel
    | SelfServiceStandaloneContactFormChannel

export type SelfServiceChannelType = SelfServiceChannel['type']

export const isSelfServiceHelpCenterChannel = (
    channel: SelfServiceChannel,
): channel is SelfServiceHelpCenterChannel =>
    channel.type === TicketChannel.HelpCenter
export const isSelfServiceChatChannel = (
    channel: SelfServiceChannel,
): channel is SelfServiceChatChannel => channel.type === TicketChannel.Chat
export const isSelfServiceStandaloneContactFormChannel = (
    channel: SelfServiceChannel,
): channel is SelfServiceStandaloneContactFormChannel =>
    channel.type === TicketChannel.ContactForm

const useSelfServiceChannels = (shopType: string, shopName: string) => {
    const chatIntegrations = useSelfServiceChatChannels(shopType, shopName)
    const helpCenters = useSelfServiceHelpCenterChannels(shopType, shopName)
    const standaloneContactForms = useSelfServiceStandaloneContactFormChannels(
        shopType,
        shopName,
    )

    return useMemo(() => {
        return [...chatIntegrations, ...helpCenters, ...standaloneContactForms]
    }, [chatIntegrations, helpCenters, standaloneContactForms])
}

export default useSelfServiceChannels
