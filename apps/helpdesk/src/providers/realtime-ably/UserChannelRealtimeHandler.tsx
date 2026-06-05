import { useCallback } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { useChannel } from '@gorgias/realtime'
import type { UseChannelProps } from '@gorgias/realtime'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'

import {
    TICKET_MESSAGE_ACTION_FAILED_EVENT,
    useTicketMessageActionFailedRealtimeMessageHandler,
} from './useTicketMessageActionFailedRealtimeMessageHandler'
import {
    useWhatsAppOnboardingRealtimeMessageHandler,
    WHATSAPP_ONBOARDING_FAILED_EVENT,
    WHATSAPP_ONBOARDING_SUCCEEDED_EVENT,
} from './useWhatsAppOnboardingRealtimeMessageHandler'

// we should export the Message type from realtime
type AblyMessage = Parameters<NonNullable<UseChannelProps['onMessage']>>[0]

export function UserChannelRealtimeHandler() {
    const accountId = useAppSelector(getCurrentAccountId)
    const userId = useAppSelector(getCurrentUserId)
    const isTicketMessageActionFailedToAblyEnabled = useFlag(
        FeatureFlagKey.TicketMessageActionFailedToAbly,
    )
    const isWhatsAppOnboardingToAblyEnabled = useFlag(
        FeatureFlagKey.WhatsAppOnboardingToAbly,
    )
    const { handleTicketMessageActionFailedRealtimeMessage } =
        useTicketMessageActionFailedRealtimeMessageHandler()
    const {
        handleWhatsAppOnboardingFailedRealtimeMessage,
        handleWhatsAppOnboardingSuccessRealtimeMessage,
    } = useWhatsAppOnboardingRealtimeMessageHandler()

    const handleMessage = useCallback(
        (message: AblyMessage) => {
            switch (message.name) {
                case TICKET_MESSAGE_ACTION_FAILED_EVENT: {
                    if (!isTicketMessageActionFailedToAblyEnabled) return

                    handleTicketMessageActionFailedRealtimeMessage(message)
                    return
                }
                case WHATSAPP_ONBOARDING_SUCCEEDED_EVENT: {
                    if (!isWhatsAppOnboardingToAblyEnabled) return

                    void handleWhatsAppOnboardingSuccessRealtimeMessage(message)
                    return
                }
                case WHATSAPP_ONBOARDING_FAILED_EVENT: {
                    if (!isWhatsAppOnboardingToAblyEnabled) return

                    handleWhatsAppOnboardingFailedRealtimeMessage(message)
                    return
                }
                default:
                    return
            }
        },
        [
            handleTicketMessageActionFailedRealtimeMessage,
            handleWhatsAppOnboardingFailedRealtimeMessage,
            handleWhatsAppOnboardingSuccessRealtimeMessage,
            isTicketMessageActionFailedToAblyEnabled,
            isWhatsAppOnboardingToAblyEnabled,
        ],
    )

    useChannel({
        channel: {
            name: 'user',
            accountId,
            userId,
        },
        onMessage: handleMessage,
    })

    return null
}
