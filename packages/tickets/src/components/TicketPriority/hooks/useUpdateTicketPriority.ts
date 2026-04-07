import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import type {
    HttpResponse,
    Ticket,
    TicketPriority,
} from '@gorgias/helpdesk-queries'
import { queryKeys, useUpdateTicket } from '@gorgias/helpdesk-queries'

import { patchTicketInViewListCache } from '../../../utils/optimisticUpdates/viewListCache'

export function useUpdateTicketPriority(ticketId: number) {
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
                toast.error('Failed to update ticket priority')
            }
        },
        [mutateAsyncUpdateTicket, queryClient, queryKey, ticketId],
    )

    return {
        updateTicketPriority,
        isLoading,
    }
}
