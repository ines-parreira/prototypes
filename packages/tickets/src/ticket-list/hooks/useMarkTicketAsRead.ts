import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { useUpdateTicket } from '@gorgias/helpdesk-queries'

import {
    LIST_VIEW_ITEMS_QUERY_KEY_PREFIX,
    patchTicketInViewListCache,
} from '../../utils/optimisticUpdates/viewListCache'

export function useMarkTicketAsRead() {
    const queryClient = useQueryClient()
    const { mutateAsync: updateTicket } = useUpdateTicket()

    const markAsRead = useCallback(
        async (ticketId: number) => {
            await queryClient.cancelQueries({
                queryKey: LIST_VIEW_ITEMS_QUERY_KEY_PREFIX,
            })
            const snapshot = queryClient.getQueriesData({
                queryKey: LIST_VIEW_ITEMS_QUERY_KEY_PREFIX,
            })

            patchTicketInViewListCache(queryClient, ticketId, {
                is_unread: false,
            })

            try {
                await updateTicket({ id: ticketId, data: { is_unread: false } })
            } catch {
                snapshot.forEach(([key, data]) =>
                    queryClient.setQueryData(key, data),
                )
            }
        },
        [queryClient, updateTicket],
    )

    return { markAsRead }
}
