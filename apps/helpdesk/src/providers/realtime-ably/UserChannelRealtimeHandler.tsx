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

// we should export the Message type from realtime
type AblyMessage = Parameters<NonNullable<UseChannelProps['onMessage']>>[0]

export function UserChannelRealtimeHandler() {
    const accountId = useAppSelector(getCurrentAccountId)
    const userId = useAppSelector(getCurrentUserId)
    const isTicketMessageActionFailedToAblyEnabled = useFlag(
        FeatureFlagKey.TicketMessageActionFailedToAbly,
    )
    const { handleTicketMessageActionFailedRealtimeMessage } =
        useTicketMessageActionFailedRealtimeMessageHandler()

    const handleMessage = useCallback(
        (message: AblyMessage) => {
            switch (message.name) {
                case TICKET_MESSAGE_ACTION_FAILED_EVENT: {
                    if (!isTicketMessageActionFailedToAblyEnabled) return

                    handleTicketMessageActionFailedRealtimeMessage(message)
                    return
                }
                default:
                    return
            }
        },
        [
            handleTicketMessageActionFailedRealtimeMessage,
            isTicketMessageActionFailedToAblyEnabled,
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
