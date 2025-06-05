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

    const assignedEmails = useMemo(
        () => store?.assignedChannels.filter(isEmailChannel),
        [store?.assignedChannels],
    )
    const unassignedEmails = useMemo(
        () => unassignedChannels.filter(isEmailChannel),
        [unassignedChannels],
    )

    const assignedChats = useMemo(
        () => store?.assignedChannels.filter(isChatChannel),
        [store?.assignedChannels],
    )
    const unnasignedChats = useMemo(
        () => unassignedChannels.filter(isChatChannel),
        [unassignedChannels],
    )

    const assignedHelpCenters = useMemo(
        () => store?.assignedChannels.filter(isHelpCenterChannel),
        [store?.assignedChannels],
    )
    const unassignedHelpCenters = useMemo(
        () => unassignedChannels.filter(isHelpCenterChannel),
        [unassignedChannels],
    )

    const assignedContactForms = useMemo(
        () => store?.assignedChannels.filter(isContactFormChannel),
        [store?.assignedChannels],
    )
    const unassignedContactForms = useMemo(
        () => unassignedChannels.filter(isContactFormChannel),
        [unassignedChannels],
    )

    const assignedVoice = useMemo(
        () => store?.assignedChannels.filter(isVoiceChannel),
        [store?.assignedChannels],
    )
    const unnasignedVoice = useMemo(
        () => unassignedChannels.filter(isVoiceChannel),
        [unassignedChannels],
    )

    const assignedSms = useMemo(
        () => store?.assignedChannels.filter(isSmsChannel),
        [store?.assignedChannels],
    )
    const unnasignedSms = useMemo(
        () => unassignedChannels.filter(isSmsChannel),
        [unassignedChannels],
    )

    const assignedWhatsApp = useMemo(
        () => store?.assignedChannels.filter(isWhatsAppChannel),
        [store?.assignedChannels],
    )
    const unnasignedWhatsApp = useMemo(
        () => unassignedChannels.filter(isWhatsAppChannel),
        [unassignedChannels],
    )

    const assignedFacebook = useMemo(
        () => store?.assignedChannels.filter(isFacebookChannel),
        [store?.assignedChannels],
    )
    const unassignedFacebook = useMemo(
        () => unassignedChannels.filter(isFacebookChannel),
        [unassignedChannels],
    )

    const assignedTikTokShop = useMemo(
        () => store?.assignedChannels.filter(isTikTokChannel),
        [store?.assignedChannels],
    )
    const unassignedTikTokShop = useMemo(
        () => unassignedChannels.filter(isTikTokChannel),
        [unassignedChannels],
    )

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
