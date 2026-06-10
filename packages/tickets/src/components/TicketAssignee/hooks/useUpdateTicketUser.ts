import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import type {
    HttpResponse,
    Ticket,
    TicketUser,
    UpdateTicketAssigneeUser,
} from '@gorgias/helpdesk-queries'
import { queryKeys, useUpdateTicket } from '@gorgias/helpdesk-queries'

import { patchTicketInViewListCache } from '../../../utils/optimisticUpdates/viewListCache'

export function useUpdateTicketUser(ticketId: number) {
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
                const response = await mutateAsyncUpdateTicket({
                    id: ticketId,
                    data: {
                        assignee_user: user ? { id: user.id } : null,
                    },
                })
                const assigneeUser =
                    response.data.assignee_user ?? (user as TicketUser | null)
                queryClient.setQueryData<HttpResponse<Ticket> | undefined>(
                    queryKey,
                    {
                        ...response,
                        data: {
                            ...response.data,
                            assignee_user: assigneeUser,
                        },
                    },
                )
                patchTicketInViewListCache(queryClient, ticketId, {
                    assignee_user: assigneeUser,
                })
                await queryClient.invalidateQueries({
                    queryKey,
                })
            } catch {
                toast.error('Failed to update user assignment')
            }
        },
        [mutateAsyncUpdateTicket, queryClient, queryKey, ticketId],
    )

    return {
        updateTicketUser,
        isLoading,
    }
}
