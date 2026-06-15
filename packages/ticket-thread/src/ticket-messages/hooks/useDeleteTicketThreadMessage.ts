import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import {
    queryKeys,
    useDeleteTicketMessage as useDeleteTicketMessagePrimitive,
} from '@gorgias/helpdesk-queries'

type DeleteTicketThreadMessageParams = {
    ticketId: number
    messageId: number
}

export function useDeleteTicketThreadMessage() {
    const queryClient = useQueryClient()
    const { mutateAsync } = useDeleteTicketMessagePrimitive()

    const deleteTicketThreadMessage = useCallback(
        async ({ ticketId, messageId }: DeleteTicketThreadMessageParams) => {
            try {
                await mutateAsync({
                    ticketId,
                    id: messageId,
                })

                await Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: queryKeys.ticketMessages.listMessages({
                            ticket_id: ticketId,
                        }),
                    }),
                    queryClient.invalidateQueries({
                        queryKey: queryKeys.ticketMessages.listAllMessages({
                            ticket_id: ticketId,
                            limit: 100,
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
                ])
            } catch {
                toast.error(
                    `Failed to delete message ${messageId} from ticket ${ticketId}`,
                )
            }
        },
        [mutateAsync, queryClient],
    )

    return { deleteTicketThreadMessage }
}
