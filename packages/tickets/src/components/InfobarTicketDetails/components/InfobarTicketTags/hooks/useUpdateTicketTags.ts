import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { HttpResponse, Ticket, TicketTag } from '@gorgias/helpdesk-queries'
import { queryKeys, useUpdateTicket } from '@gorgias/helpdesk-queries'

import { useTicketsLegacyBridge } from '../../../../../utils/LegacyBridge'
import { NotificationStatus } from '../../../../../utils/LegacyBridge/context'

export const sortByAscendingIdOrder = <T extends { id: number }>(a: T, b: T) =>
    (a.id - b.id) * 1

export function useUpdateTicketTags(ticketId: string) {
    const { dispatchNotification } = useTicketsLegacyBridge()
    const queryClient = useQueryClient()
    const queryKey = queryKeys.tickets.getTicket(Number(ticketId))

    const { mutateAsync: mutateAsyncUpdateTicket } = useUpdateTicket({
        mutation: {
            onMutate: async (data) => {
                await queryClient.cancelQueries({ queryKey })
                queryClient.setQueryData<HttpResponse<Ticket> | undefined>(
                    queryKey,
                    (old) => {
                        if (!old) return old
                        const previousTicket = old.data
                        const nextTags = (data.data.tags as TicketTag[]) ?? []
                        return {
                            ...old,
                            data: {
                                ...previousTicket,
                                tags: nextTags,
                            },
                        }
                    },
                )
            },
        },
    })

    const updateTicketTags = useCallback(
        async (ticketId: number, data: { tags: TicketTag[] }) => {
            try {
                await mutateAsyncUpdateTicket({
                    id: ticketId,
                    data,
                })
                await queryClient.invalidateQueries({
                    queryKey,
                })
            } catch {
                dispatchNotification({
                    status: NotificationStatus.Error,
                    message: 'Failed to update ticket tags',
                })
            }
        },
        [mutateAsyncUpdateTicket, queryClient, queryKey, dispatchNotification],
    )

    return {
        updateTicketTags,
    }
}
