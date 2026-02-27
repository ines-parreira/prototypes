import type { InfiniteData, QueryClient } from '@tanstack/react-query'

import type { Ticket } from '@gorgias/helpdesk-queries'

const LIST_VIEW_ITEMS_QUERY_KEY_PREFIX = ['views', 'listViewItems']

type ViewListPage = { data: Ticket[] }

export function patchTicketInViewListCache(
    queryClient: QueryClient,
    ticketId: number,
    patch: Partial<Ticket>,
) {
    queryClient.setQueriesData<InfiniteData<ViewListPage>>(
        { queryKey: LIST_VIEW_ITEMS_QUERY_KEY_PREFIX },
        (old) => {
            if (!old?.pages) return old
            return {
                ...old,
                pages: old.pages.map((page) => ({
                    ...page,
                    data: page.data.map((t) =>
                        t.id === ticketId ? { ...t, ...patch } : t,
                    ),
                })),
            }
        },
    )
}

export function removeTicketFromViewListCache(
    queryClient: QueryClient,
    ticketId: number,
) {
    queryClient.setQueriesData<InfiniteData<ViewListPage>>(
        { queryKey: LIST_VIEW_ITEMS_QUERY_KEY_PREFIX },
        (old) => {
            if (!old?.pages) return old
            return {
                ...old,
                pages: old.pages.map((page) => ({
                    ...page,
                    data: page.data.filter((t) => t.id !== ticketId),
                })),
            }
        },
    )
}
