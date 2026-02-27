import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type {
    HttpResponse,
    Ticket,
    TicketUser,
    UpdateTicketAssigneeUser,
} from '@gorgias/helpdesk-queries'
import { queryKeys, useUpdateTicket } from '@gorgias/helpdesk-queries'

import { useTicketsLegacyBridge } from '../../../utils/LegacyBridge'
import { NotificationStatus } from '../../../utils/LegacyBridge/context'
import { patchTicketInViewListCache } from '../../../utils/optimisticUpdates/viewListCache'

export function useUpdateTicketUser(ticketId: number) {
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
                            const nextUser = data.data.assignee_user ?? null

                            return {
                                ...old,
                                data: {
                                    ...previousTicket,
                                    assignee_user:
                                        nextUser as TicketUser | null,
                                },
                            }
                        },
                    )
                },
            },
        },
    )

    const updateTicketUser = useCallback(
        async (user: UpdateTicketAssigneeUser | null) => {
            try {
                await mutateAsyncUpdateTicket({
                    id: ticketId,
                    data: {
                        assignee_user: user ? { id: user.id } : null,
                    },
                })
                patchTicketInViewListCache(queryClient, ticketId, {
                    assignee_user: user as TicketUser | null,
                })
                await queryClient.invalidateQueries({
                    queryKey,
                })
            } catch {
                dispatchNotification({
                    status: NotificationStatus.Error,
                    message: 'Failed to update user assignment',
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
        updateTicketUser,
        isLoading,
    }
}
