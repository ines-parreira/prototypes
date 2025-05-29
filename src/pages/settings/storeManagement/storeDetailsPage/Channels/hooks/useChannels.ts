import { useMemo } from 'react'

import { toNumber } from 'lodash'
import { useParams } from 'react-router-dom'

import {
    isChatChannel,
    isContactFormChannel,
    isEmailChannel,
    isFacebookChannel,
    isHelpCenterChannel,
    isSmsChannel,
    isTikTokChannel,
    isVoiceChannel,
    isWhatsAppChannel,
} from '../../../helpers/isIntegration'
import { useStoreManagementState } from '../../../StoreManagementProvider'
import { ChannelWithMetadata } from '../../../types'

export const useChannels = (): ChannelWithMetadata[] => {
    const { id } = useParams<{ id: string }>()
    const { stores, unassignedChannels } = useStoreManagementState()
    const store = stores.find((store) => store.store.id === toNumber(id))

    const assignedEmails = store?.assignedChannels.filter(isEmailChannel)
    const unassignedEmails = unassignedChannels.filter(isEmailChannel)

    const assignedChats = store?.assignedChannels.filter(isChatChannel)
    const unnasignedChats = unassignedChannels.filter(isChatChannel)

    const assignedHelpCenters =
        store?.assignedChannels.filter(isHelpCenterChannel)
    const unassignedHelpCenters = unassignedChannels.filter(isHelpCenterChannel)

    const assignedContactForms =
        store?.assignedChannels.filter(isContactFormChannel)
    const unassignedContactForms =
        unassignedChannels.filter(isContactFormChannel)

    const assignedVoice = store?.assignedChannels.filter(isVoiceChannel)
    const unnasignedVoice = unassignedChannels.filter(isVoiceChannel)

    const assignedSms = store?.assignedChannels.filter(isSmsChannel)
    const unnasignedSms = unassignedChannels.filter(isSmsChannel)

    const assignedWhatsApp = store?.assignedChannels.filter(isWhatsAppChannel)
    const unnasignedWhatsApp = unassignedChannels.filter(isWhatsAppChannel)

    const assignedFacebook = store?.assignedChannels.filter(isFacebookChannel)
    const unassignedFacebook = unassignedChannels.filter(isFacebookChannel)

    const assignedTikTokShop = store?.assignedChannels.filter(isTikTokChannel)
    const unassignedTikTokShop = unassignedChannels.filter(isTikTokChannel)

    return useMemo(
        () => [
            {
                title: 'Email',
                description: '',
                count: assignedEmails?.length || 0,
                type: 'email',
                assignedChannels: assignedEmails || [],
                unassignedChannels: unassignedEmails,
            },
            {
                title: 'Chat',
                description: '',
                count: assignedChats?.length || 0,
                type: 'chat',
                assignedChannels: assignedChats || [],
                unassignedChannels: unnasignedChats,
            },
            {
                title: 'Help Center',
                description: '',
                count: assignedHelpCenters?.length || 0,
                type: 'helpCenter',
                assignedChannels: assignedHelpCenters || [],
                unassignedChannels: unassignedHelpCenters,
            },
            {
                title: 'Contact Form',
                description: '',
                count: assignedContactForms?.length || 0,
                type: 'contactForm',
                assignedChannels: assignedContactForms || [],
                unassignedChannels: unassignedContactForms,
            },

            {
                title: 'Voice',
                description: '',
                count: assignedVoice?.length || 0,
                type: 'voice',
                assignedChannels: assignedVoice || [],
                unassignedChannels: unnasignedVoice,
            },
            {
                title: 'SMS',
                description: '',
                count: assignedSms?.length || 0,
                type: 'sms',
                assignedChannels: assignedSms || [],
                unassignedChannels: unnasignedSms,
            },

            {
                title: 'WhatsApp',
                description: '',
                count: assignedWhatsApp?.length || 0,
                type: 'whatsApp',
                assignedChannels: assignedWhatsApp || [],
                unassignedChannels: unnasignedWhatsApp,
            },
            {
                title: 'Facebook, Messenger & Instagram',
                description: '',
                count: assignedFacebook?.length || 0,
                type: 'facebook',
                assignedChannels: assignedFacebook || [],
                unassignedChannels: unassignedFacebook,
            },
            {
                title: 'TikTok Shop',
                description: '',
                count: assignedTikTokShop?.length || 0,
                type: 'tiktokShop',
                assignedChannels: assignedTikTokShop || [],
                unassignedChannels: unassignedTikTokShop,
            },
        ],
        [
            assignedEmails,
            unassignedEmails,
            assignedChats,
            unnasignedChats,
            assignedHelpCenters,
            unassignedHelpCenters,
            assignedContactForms,
            unassignedContactForms,
            assignedVoice,
            unnasignedVoice,
            assignedSms,
            unnasignedSms,
            assignedWhatsApp,
            unnasignedWhatsApp,
            assignedFacebook,
            unassignedFacebook,
            assignedTikTokShop,
            unassignedTikTokShop,
        ],
    )
}
