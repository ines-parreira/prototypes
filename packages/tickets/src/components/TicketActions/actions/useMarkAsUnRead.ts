import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { HttpResponse, Ticket } from '@gorgias/helpdesk-queries'
import { queryKeys, useUpdateTicket } from '@gorgias/helpdesk-queries'

import { useTicketsLegacyBridge } from '../../../utils/LegacyBridge'
import { NotificationStatus } from '../../../utils/LegacyBridge/context'
import { patchTicketInViewListCache } from '../../../utils/optimisticUpdates/viewListCache'

export function useMarkAsUnRead(ticketId: number) {
    const { dispatchNotification, onToggleUnread } = useTicketsLegacyBridge()

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
                        const nextUnRead = data.data.is_unread ?? false
                        return {
                            ...old,
                            data: {
                                ...previousTicket,
                                is_unread: nextUnRead,
                            },
                        }
                    },
                )
            },
        },
    })

    const markAsUnRead = useCallback(
        async (ticketId: number, data: { is_unread: boolean }) => {
            try {
                await mutateAsyncUpdateTicket({
                    id: ticketId,
                    data,
                })
                patchTicketInViewListCache(queryClient, ticketId, {
                    is_unread: data.is_unread,
                })
                await queryClient.invalidateQueries({
                    queryKey,
                })
                onToggleUnread?.(ticketId, data.is_unread)
                dispatchNotification({
                    status: NotificationStatus.Success,
                    message: 'Ticket has been marked as unread',
                })
            } catch {
                dispatchNotification({
                    status: NotificationStatus.Error,
                    message: 'Failed to mark as unread',
                })
            }
        },
        [
            mutateAsyncUpdateTicket,
            queryClient,
            queryKey,
            dispatchNotification,
            onToggleUnread,
        ],
    )

    return {
        markAsUnRead,
    }
}
