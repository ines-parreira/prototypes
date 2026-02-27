import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type {
    HttpResponse,
    Ticket,
    TicketPriority,
} from '@gorgias/helpdesk-queries'
import { queryKeys, useUpdateTicket } from '@gorgias/helpdesk-queries'

import { useTicketsLegacyBridge } from '../../../utils/LegacyBridge'
import { NotificationStatus } from '../../../utils/LegacyBridge/context'
import { patchTicketInViewListCache } from '../../../utils/optimisticUpdates/viewListCache'

export function useUpdateTicketPriority(ticketId: number) {
    const { dispatchNotification } = useTicketsLegacyBridge()
    const queryClient = useQueryClient()
    const queryKey = queryKeys.tickets.getTicket(ticketId)

    const { mutateAsync: mutateAsyncUpdateTicket, isLoading } = useUpdateTicket(
        {
            mutation: {
                onMutate: async (data) => {
                    await queryClient.cancelQueries({ queryKey })
                    queryClient.setQueryData<HttpResponse<Ticket> | undefined>(
                        queryKey,
                        (old) => {
                            if (!old) return old
                            const previousTicket = old.data
                            const nextPriority = data.data.priority

                            return {
                                ...old,
                                data: {
                                    ...previousTicket,
                                    priority: nextPriority as
                                        | TicketPriority
                                        | undefined,
                                },
                            }
                        },
                    )
                },
            },
        },
    )

    const updateTicketPriority = useCallback(
        async (priority: TicketPriority) => {
            try {
                await mutateAsyncUpdateTicket({
                    id: ticketId,
                    data: {
                        priority,
                    },
                })
                patchTicketInViewListCache(queryClient, ticketId, { priority })
                await queryClient.invalidateQueries({
                    queryKey,
                })
            } catch {
                dispatchNotification({
                    status: NotificationStatus.Error,
                    message: 'Failed to update ticket priority',
                })
            }
        },
        [
            mutateAsyncUpdateTicket,
            queryClient,
            queryKey,
            dispatchNotification,
            ticketId,
        ],
    )

    return {
        updateTicketPriority,
        isLoading,
    }
}
