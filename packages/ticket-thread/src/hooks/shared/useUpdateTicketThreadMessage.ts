import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import {
    queryKeys,
    useUpdateTicketMessage as useUpdateTicketMessagePrimitive,
} from '@gorgias/helpdesk-queries'
import type {
    UpdateTicketMessageAction,
    UpdateTicketMessageBody,
} from '@gorgias/helpdesk-types'

type UpdateTicketThreadMessageParams = {
    ticketId: number
    messageId: number
    data: Partial<UpdateTicketMessageBody>
    action?: UpdateTicketMessageAction
}

export function useUpdateTicketThreadMessage() {
    const queryClient = useQueryClient()
    const { mutateAsync } = useUpdateTicketMessagePrimitive()

    const updateTicketThreadMessage = useCallback(
        async ({
            ticketId,
            messageId,
            data,
            action,
        }: UpdateTicketThreadMessageParams) => {
            try {
                await mutateAsync({
                    ticketId,
                    id: messageId,
                    data: data as UpdateTicketMessageBody,
                    params: action ? { action } : undefined,
                })

                await Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: queryKeys.ticketMessages.listMessages({
                            ticket_id: ticketId,
                        }),
                    }),
                    queryClient.invalidateQueries({
                        queryKey: queryKeys.ticketMessages.getTicketMessage(
                            ticketId,
                            messageId,
                        ),
                    }),
                    queryClient.invalidateQueries({
                        queryKey: queryKeys.tickets.getTicket(ticketId),
                    }),
                    ...(action === 'retry'
                        ? [
                              queryClient.invalidateQueries({
                                  queryKey: queryKeys.tickets.all(),
                              }),
                          ]
                        : []),
                ])
            } catch {
                toast.error(
                    'Message was not sent. Please try again in a few moments. If the problem persists, contact us.',
                )
            }
        },
        [mutateAsync, queryClient],
    )

    return { updateTicketThreadMessage }
}
