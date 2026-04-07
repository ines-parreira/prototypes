import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import type { HttpResponse, Ticket } from '@gorgias/helpdesk-queries'
import { queryKeys, useUpdateTicket } from '@gorgias/helpdesk-queries'

import { useTicketsLegacyBridge } from '../../../utils/LegacyBridge'
import { patchTicketInViewListCache } from '../../../utils/optimisticUpdates/viewListCache'

export function useMarkAsUnRead(ticketId: number) {
    const { onToggleUnread } = useTicketsLegacyBridge()

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
                toast.success('Ticket has been marked as unread')
            } catch {
                toast.error('Failed to mark as unread')
            }
        },
        [mutateAsyncUpdateTicket, queryClient, queryKey, onToggleUnread],
    )

    return {
        markAsUnRead,
    }
}
