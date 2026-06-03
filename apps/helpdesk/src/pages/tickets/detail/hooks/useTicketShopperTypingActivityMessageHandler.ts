import { useCallback } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import type { UseChannelProps } from '@gorgias/realtime'

import useAppDispatch from 'hooks/useAppDispatch'
import { setTypingActivityShopper } from 'state/ticket/actions'

const TICKET_TYPING_ACTIVITY_SHOPPER_STARTED_ABLY_EVENT =
    'ticket-typing-activity-shopper.started'

type AblyMessage = Parameters<NonNullable<UseChannelProps['onMessage']>>[0]

type UseTicketShopperTypingActivityMessageHandlerArgs = {
    ticketId: number
}

export function useTicketShopperTypingActivityMessageHandler({
    ticketId,
}: UseTicketShopperTypingActivityMessageHandlerArgs) {
    const dispatch = useAppDispatch()
    const isEnabled = useFlag(
        FeatureFlagKey.TicketTypingActivityShopperStartedAblyMigration,
        false,
    )

    const handleMessage = useCallback(
        (message: AblyMessage) => {
            if (
                !isEnabled ||
                Number.isNaN(ticketId) ||
                message.name !==
                    TICKET_TYPING_ACTIVITY_SHOPPER_STARTED_ABLY_EVENT
            ) {
                return
            }

            dispatch(setTypingActivityShopper(ticketId))
        },
        [dispatch, isEnabled, ticketId],
    )

    return { handleMessage }
}
