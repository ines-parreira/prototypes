import type { InfiniteData, QueryClient } from '@tanstack/react-query'

import { queryKeys } from '@gorgias/helpdesk-queries'
import type { Ticket } from '@gorgias/helpdesk-queries'

export const LIST_VIEW_ITEMS_QUERY_KEY_PREFIX = [
    ...queryKeys.views.all(),
    'listViewItems',
] as const

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

            let didChange = false
            const nextPages = old.pages.map((page) => {
                let pageChanged = false

                const nextData = page.data.map((t) => {
                    if (t.id !== ticketId) return t
                    pageChanged = true
                    return { ...t, ...patch }
                })

                if (!pageChanged) return page
                didChange = true
                return { ...page, data: nextData }
            })

            if (!didChange) return old
            return { ...old, pages: nextPages }
        },
    )
}

export function patchAllTicketsInViewListCache(
    queryClient: QueryClient,
    viewId: number,
    patch: Partial<Ticket>,
) {
    queryClient.setQueriesData<InfiniteData<ViewListPage>>(
        { queryKey: [...LIST_VIEW_ITEMS_QUERY_KEY_PREFIX, viewId] },
        (old) => {
            if (!old?.pages) return old

            return {
                ...old,
                pages: old.pages.map((page) => ({
                    ...page,
                    data: page.data.map((t) => ({ ...t, ...patch })),
                })),
            }
        },
    )
}

export function removeAllTicketsFromViewListCache(
    queryClient: QueryClient,
    viewId: number,
) {
    queryClient.setQueriesData<InfiniteData<ViewListPage>>(
        { queryKey: [...LIST_VIEW_ITEMS_QUERY_KEY_PREFIX, viewId] },
        (old) => {
            if (!old?.pages) return old

            const alreadyEmpty = old.pages.every((p) => p.data.length === 0)
            if (alreadyEmpty) return old

            return {
                ...old,
                pages: old.pages.map((page) =>
                    page.data.length === 0 ? page : { ...page, data: [] },
                ),
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

            let didChange = false
            const nextPages = old.pages.map((page) => {
                const nextData = page.data.filter((t) => t.id !== ticketId)
                if (nextData.length === page.data.length) return page
                didChange = true
                return { ...page, data: nextData }
            })

            if (!didChange) return old
            return { ...old, pages: nextPages }
        },
    )
}
