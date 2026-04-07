import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import type {
    HttpResponse,
    Ticket,
    TicketCustomer,
} from '@gorgias/helpdesk-queries'
import { queryKeys, useUpdateTicket } from '@gorgias/helpdesk-queries'

export function useUpdateTicketCustomer(ticketId: string) {
    const queryClient = useQueryClient()
    const ticketIdNum = parseInt(ticketId, 10)
    const queryKey = queryKeys.tickets.getTicket(ticketIdNum)

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
                            const nextCustomer = data.data.customer

                            if (!nextCustomer || !nextCustomer.id) {
                                return old
                            }

                            return {
                                ...old,
                                data: {
                                    ...previousTicket,
                                    customer: nextCustomer as TicketCustomer,
                                },
                            }
                        },
                    )
                },
            },
        },
    )

    const updateTicketCustomer = useCallback(
        async (newCustomer: TicketCustomer) => {
            try {
                await mutateAsyncUpdateTicket({
                    id: ticketIdNum,
                    data: {
                        customer: newCustomer,
                    },
                })
                await queryClient.invalidateQueries({
                    queryKey,
                })
            } catch {
                toast.error('Failed to update ticket customer')
            }
        },
        [mutateAsyncUpdateTicket, queryClient, queryKey, ticketIdNum],
    )

    return {
        updateTicketCustomer,
        isLoading,
    }
}
