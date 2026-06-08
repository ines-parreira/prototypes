import { useEffect } from 'react'
import { Duration } from '@gorgias/toolkit'

import { useQueryClient } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'

import type { Ticket } from '@gorgias/helpdesk-queries'
import { queryKeys, useListViewItemsUpdates } from '@gorgias/helpdesk-queries'
import type { ListViewItemsUpdates200DataItem } from '@gorgias/helpdesk-types'

import { getNextCursorFromMeta } from '../utils/cursors'
import type { UseTicketsListParams } from './useTicketsList'

// ES (Elasticsearch) hard limit on results returned per request
const MAX_API_RESULTS = 300

type Props = {
    viewId: number
    params: UseTicketsListParams | undefined
    upToCursor: string | undefined
    enabled: boolean
}

type DiffResult = {
    removedIds: Set<number>
    staleIds: Set<number>
    insertedIds: Set<number>
}

function invalidateTicketCaches(
    queryClient: ReturnType<typeof useQueryClient>,
    ticketIds: Iterable<number>,
) {
    for (const ticketId of ticketIds) {
        const queryKey = queryKeys.tickets.getTicket(ticketId)
        if (!queryClient.getQueryState(queryKey)) continue

        void queryClient.invalidateQueries({ queryKey })
    }
}

function buildCachedTimestamps(
    cached: InfiniteData<{
        data: Ticket[]
        meta?: { next_items?: string | null }
    }>,
): Map<number, string | null> {
    return new Map(
        cached.pages
            .flatMap((p) => p.data)
            .map((t) => [t.id, t.updated_datetime]),
    )
}

function getCachedUpToCursor(
    cached: InfiniteData<{
        data: Ticket[]
        meta?: { next_items?: string | null }
    }>,
) {
    const lastPage = cached.pages[cached.pages.length - 1]
    return getNextCursorFromMeta(lastPage?.meta)
}

function diffUpdatesAgainstCache(
    updates: ListViewItemsUpdates200DataItem[],
    cachedUpdatedAt: Map<number, string | null>,
): DiffResult {
    const updateIds = new Set<number>()
    const removedIds = new Set<number>()
    const staleIds = new Set<number>()
    const insertedIds = new Set<number>()

    for (const update of updates) {
        if (update.id === undefined) continue

        updateIds.add(update.id)

        const cachedTime = cachedUpdatedAt.get(update.id)
        if (!cachedUpdatedAt.has(update.id)) {
            insertedIds.add(update.id)
            continue
        }

        if (
            cachedTime != null &&
            update.updated_datetime != null &&
            new Date(update.updated_datetime).getTime() >
                new Date(cachedTime).getTime()
        ) {
            staleIds.add(update.id)
        }
    }

    if (cachedUpdatedAt.size <= MAX_API_RESULTS) {
        for (const cachedId of cachedUpdatedAt.keys()) {
            if (!updateIds.has(cachedId)) {
                removedIds.add(cachedId)
            }
        }
    }

    return {
        removedIds,
        staleIds,
        insertedIds,
    }
}

function hasInsertedTicketInFirstPage(
    updates: ListViewItemsUpdates200DataItem[],
    cachedUpdatedAt: Map<number, string | null>,
    firstPageSize: number,
) {
    return updates
        .slice(0, firstPageSize)
        .some(
            (update) =>
                typeof update.id === 'number' &&
                !cachedUpdatedAt.has(update.id),
        )
}

export function useRefreshStaleTickets({
    viewId,
    params,
    upToCursor,
    enabled,
}: Props) {
    const queryClient = useQueryClient()

    const { data: updates } = useListViewItemsUpdates(
        viewId,
        {
            order_by: params?.order_by,
            up_to_cursor: upToCursor,
        },
        {
            query: {
                enabled,
                refetchInterval: Duration.seconds(5),
                refetchIntervalInBackground: false,
                refetchOnWindowFocus: false,
                staleTime: Duration.seconds(5),
                select: (response) => response.data.data,
            },
        },
    )

    useEffect(() => {
        if (!updates) return

        const cached = queryClient.getQueryData<
            InfiniteData<{
                data: Ticket[]
                meta?: { next_items?: string | null }
            }>
        >(queryKeys.views.listViewItems(viewId, params))
        if (!cached) return

        const cachedUpdatedAt = buildCachedTimestamps(cached)
        const cachedUpToCursor = getCachedUpToCursor(cached)
        const canApplyRemovals = cachedUpToCursor === upToCursor
        const { removedIds, staleIds, insertedIds } = diffUpdatesAgainstCache(
            updates,
            cachedUpdatedAt,
        )
        const shouldRefetchFirstPageOnly =
            insertedIds.size > 0 &&
            hasInsertedTicketInFirstPage(
                updates,
                cachedUpdatedAt,
                cached.pages[0]?.data.length ?? 0,
            )

        if (canApplyRemovals && removedIds.size > 0) {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.views.listViewItems(viewId, params),
            })
            invalidateTicketCaches(
                queryClient,
                updates.flatMap((update) =>
                    typeof update.id === 'number' ? [update.id] : [],
                ),
            )
        } else if (canApplyRemovals && insertedIds.size > 0) {
            if (shouldRefetchFirstPageOnly) {
                void queryClient.invalidateQueries({
                    queryKey: queryKeys.views.listViewItems(viewId, params),
                    refetchPage: (
                        _page: { data: Array<{ id?: number }> },
                        index: number,
                    ) => index === 0,
                })
            } else {
                void queryClient.invalidateQueries({
                    queryKey: queryKeys.views.listViewItems(viewId, params),
                })
            }
        } else if (staleIds.size > 0) {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.views.listViewItems(viewId, params),
                refetchPage: (page: { data: Array<{ id?: number }> }) =>
                    page.data.some(
                        (ticket) =>
                            ticket.id !== undefined && staleIds.has(ticket.id),
                    ),
            })
            invalidateTicketCaches(queryClient, staleIds)
        }
    }, [updates, queryClient, viewId, params, upToCursor])
}
