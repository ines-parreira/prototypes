import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type {
    HttpResponse,
    Ticket,
    TicketCustomer,
} from '@gorgias/helpdesk-queries'
import { queryKeys, useUpdateTicket } from '@gorgias/helpdesk-queries'

import { useTicketsLegacyBridge } from '../../../utils/LegacyBridge'
import { NotificationStatus } from '../../../utils/LegacyBridge/context'

export function useUpdateTicketCustomer(ticketId: string) {
    const { dispatchNotification } = useTicketsLegacyBridge()
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
                dispatchNotification({
                    status: NotificationStatus.Error,
                    message: 'Failed to update ticket customer',
                })
            }
        },
        [
            mutateAsyncUpdateTicket,
            queryClient,
            queryKey,
            dispatchNotification,
            ticketIdNum,
        ],
    )

    return {
        updateTicketCustomer,
        isLoading,
    }
}
