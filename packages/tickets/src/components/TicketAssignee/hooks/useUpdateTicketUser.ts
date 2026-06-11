import { useCallback, useRef } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import type {
    HttpResponse,
    Ticket,
    TicketUser,
    User,
} from '@gorgias/helpdesk-queries'
import { queryKeys, useUpdateTicket } from '@gorgias/helpdesk-queries'

import { patchTicketInViewListCache } from '../../../utils/optimisticUpdates/viewListCache'

export function useUpdateTicketUser(ticketId: number) {
    const queryClient = useQueryClient()
    const queryKey = queryKeys.tickets.getTicket(ticketId)
    const optimisticAssigneeUserRef = useRef<TicketUser | null>(null)

    const { mutateAsync: mutateAsyncUpdateTicket, isLoading } = useUpdateTicket(
        {
            mutation: {
                onMutate: async () => {
                    await queryClient.cancelQueries({ queryKey })
                    queryClient.setQueryData<HttpResponse<Ticket> | undefined>(
                        queryKey,
                        (old) => {
                            if (!old) return old
                            const previousTicket = old.data

                            return {
                                ...old,
                                data: {
                                    ...previousTicket,
                                    assignee_user:
                                        optimisticAssigneeUserRef.current,
                                },
                            }
                        },
                    )
                },
            },
        },
    )

    const updateTicketUser = useCallback(
        async (user: User | TicketUser | null) => {
            const optimisticAssigneeUser = user ? (user as TicketUser) : null
            optimisticAssigneeUserRef.current = optimisticAssigneeUser

            try {
                const response = await mutateAsyncUpdateTicket({
                    id: ticketId,
                    data: {
                        assignee_user: user ? { id: user.id } : null,
                    },
                })
                const assigneeUser =
                    response.data.assignee_user ?? optimisticAssigneeUser
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
            } finally {
                optimisticAssigneeUserRef.current = null
            }
        },
        [mutateAsyncUpdateTicket, queryClient, queryKey, ticketId],
    )

    return {
        updateTicketUser,
        isLoading,
    }
}
