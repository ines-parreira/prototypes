import { useCallback } from 'react'

import { appQueryClient } from '@repo/api-resources'
import { isRecord } from '@repo/utils'

import { queryKeys } from '@gorgias/helpdesk-queries'
import type { UseChannelProps } from '@gorgias/realtime'

import useAppDispatch from 'hooks/useAppDispatch'
import * as ticketActions from 'state/ticket/actions'

import { parseMessageData } from './parseMessageData'

export const TICKET_MESSAGE_ACTION_FAILED_EVENT = 'ticket-message-action.failed'

type AblyMessage = Parameters<NonNullable<UseChannelProps['onMessage']>>[0]

function getTicketId(data: unknown): number | undefined {
    if (!isRecord(data)) return undefined

    const ticketId = Number(data.ticket_id)

    return Number.isFinite(ticketId) ? ticketId : undefined
}

export function useTicketMessageActionFailedRealtimeMessageHandler() {
    const dispatch = useAppDispatch()

    const handleTicketMessageActionFailedRealtimeMessage = useCallback(
        (message: AblyMessage) => {
            const ticketId = getTicketId(parseMessageData(message.data))

            if (ticketId === undefined) return

            if (ticketId) {
                void appQueryClient.invalidateQueries({
                    queryKey: queryKeys.tickets.getTicket(ticketId),
                })
                void appQueryClient.invalidateQueries({
                    queryKey: queryKeys.ticketMessages.listMessages({
                        ticket_id: ticketId,
                    }),
                })
            }

            void appQueryClient.invalidateQueries({
                queryKey: queryKeys.customFields.all(),
            })
            dispatch(
                ticketActions.handleMessageActionError(
                    ticketId as unknown as string,
                ) as any,
            )
        },
        [dispatch],
    )

    return { handleTicketMessageActionFailedRealtimeMessage }
}
