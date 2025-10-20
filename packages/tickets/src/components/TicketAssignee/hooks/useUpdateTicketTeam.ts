import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    HttpResponse,
    queryKeys,
    Team,
    Ticket,
    TicketTeam,
    useUpdateTicket,
} from '@gorgias/helpdesk-queries'

import { useTicketsLegacyBridge } from '../../../utils/LegacyBridge'
import { NotificationStatus } from '../../../utils/LegacyBridge/context'

export function useUpdateTicketTeam(ticketId: number) {
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
                            const nextTeam = data.data.assignee_team ?? null

                            return {
                                ...old,
                                data: {
                                    ...previousTicket,
                                    // the response will not be the full team object, but the ID is enough to do a correct team lookup
                                    assignee_team: nextTeam as TicketTeam,
                                },
                            }
                        },
                    )
                },
            },
        },
    )

    const updateTicketTeam = useCallback(
        async (team: Team | null) => {
            try {
                await mutateAsyncUpdateTicket({
                    id: ticketId,
                    data: {
                        assignee_team: team ? { id: team.id } : null,
                    },
                })
                await queryClient.invalidateQueries({
                    queryKey,
                })
            } catch {
                dispatchNotification({
                    status: NotificationStatus.Error,
                    message: 'Failed to update team assignment',
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
        updateTicketTeam,
        isLoading,
    }
}
