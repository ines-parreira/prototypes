import { useMemo } from 'react'

import { DurationInMs } from '@repo/utils'
import { useInfiniteQuery } from '@tanstack/react-query'

import { listViewItems } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type {
    ListViewItemsUpdatesOrderBy,
    TicketCompact,
} from '@gorgias/helpdesk-types'

import { getNextCursorFromMeta } from '../utils/cursors'
import { useRefreshStaleTickets } from './useRefreshStaleTickets'

export type UseTicketsListParams = {
    order_by?: ListViewItemsUpdatesOrderBy
}

const PAGE_SIZE = 25
const STALE_TIME_MS = DurationInMs.ThirtySeconds

export function getTicketsListQueryKey(
    viewId: number,
    params?: UseTicketsListParams,
) {
    return queryKeys.views.listViewItems(viewId, params)
}

export function useTicketsList(
    viewId: number,
    params?: UseTicketsListParams,
    pauseUpdates?: boolean,
    enableStaleUpdates = true,
) {
    const query = useInfiniteQuery({
        queryKey: getTicketsListQueryKey(viewId, params),
        queryFn: async ({ pageParam, signal }) => {
            const response = await listViewItems(
                viewId,
                {
                    order_by: params?.order_by,
                    cursor: pageParam,
                    limit: PAGE_SIZE,
                },
                { signal },
            )
            return response.data
        },
        getNextPageParam: (lastPage) => {
            return getNextCursorFromMeta(lastPage.meta)
        },
        staleTime: STALE_TIME_MS,
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
        enabled: enableStaleUpdates && !query.isLoading && !pauseUpdates,
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
