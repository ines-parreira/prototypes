import { useMemo } from 'react'
import { Duration } from '@gorgias/toolkit'

import { useInfiniteQuery } from '@tanstack/react-query'

import { listViewItems } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type {
    ListViewItemsUpdatesOrderBy,
    TicketCompact,
} from '@gorgias/helpdesk-types'

import { getNextCursorFromMeta } from '../utils/cursors'
import { isInaccessibleViewItemsError } from '../utils/isInaccessibleViewItemsError'
import { useRefreshStaleTickets } from './useRefreshStaleTickets'

export type UseTicketsListParams = {
    order_by?: ListViewItemsUpdatesOrderBy
    limit?: number
}

export type UseTicketsListOptions = {
    params?: UseTicketsListParams
    pauseUpdates?: boolean
    enableStaleUpdates?: boolean
    enabled?: boolean
}

export const PAGE_SIZE = 25
export function getTicketsListQueryKey(
    viewId: number,
    params?: UseTicketsListParams,
) {
    return queryKeys.views.listViewItems(viewId, params)
}

export function getNavigableTicketsListQueryKey(
    viewId: number,
    sortOrder: ListViewItemsUpdatesOrderBy,
) {
    return getTicketsListQueryKey(viewId, { order_by: sortOrder })
}

export function useTicketsList(
    viewId: number,
    {
        params,
        pauseUpdates,
        enableStaleUpdates = true,
        enabled = true,
    }: UseTicketsListOptions = {},
) {
    const query = useInfiniteQuery({
        queryKey: getTicketsListQueryKey(viewId, params),
        enabled,
        queryFn: async ({ pageParam, signal }) => {
            const response = await listViewItems(
                viewId,
                {
                    order_by: params?.order_by,
                    cursor: pageParam,
                    limit: params?.limit ?? PAGE_SIZE,
                },
                { signal },
            )
            return response.data
        },
        getNextPageParam: (lastPage) => {
            return getNextCursorFromMeta(lastPage.meta)
        },
        staleTime: Duration.seconds(30),
        refetchOnWindowFocus: true,
    })

    const tickets = useMemo(
        () =>
            query.data?.pages.flatMap((page) => page.data as TicketCompact[]) ??
            [],
        [query.data],
    )

    const upToCursor = useMemo(() => {
        const pages = query.data?.pages
        if (!pages?.length) return undefined

        const lastPage = pages[pages.length - 1]
        return getNextCursorFromMeta(lastPage.meta)
    }, [query.data])

    useRefreshStaleTickets({
        viewId,
        params,
        upToCursor,
        enabled:
            enabled &&
            enableStaleUpdates &&
            !query.isLoading &&
            !pauseUpdates &&
            !isInaccessibleViewItemsError(query.error),
    })

    return {
        tickets,
        fetchNextPage: query.fetchNextPage,
        hasNextPage: query.hasNextPage,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isFetchingNextPage: query.isFetchingNextPage,
        error: query.error,
        data: query.data,
        refetch: query.refetch,
    }
}
