import { useEffect } from 'react'

import { DurationInMs } from '@repo/utils'
import { useQueryClient } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'

import type { Ticket } from '@gorgias/helpdesk-queries'
import { queryKeys, useListViewItemsUpdates } from '@gorgias/helpdesk-queries'
import type { ListViewItemsUpdates200DataItem } from '@gorgias/helpdesk-types'

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
    needsFullRefetch: boolean
    staleIds: Set<number>
}

function buildCachedTimestamps(
    cached: InfiniteData<{ data: Ticket[] }>,
): Map<number, string | null> {
    return new Map(
        cached.pages
            .flatMap((p) => p.data)
            .map((t) => [t.id, t.updated_datetime]),
    )
}

function diffUpdatesAgainstCache(
    updates: ListViewItemsUpdates200DataItem[],
    cachedUpdatedAt: Map<number, string | null>,
): DiffResult {
    const updateIds = new Set<number>()
    const staleIds = new Set<number>()
    let minUpdateTime = Infinity
    let needsFullRefetch = false

    for (const update of updates) {
        if (update.id === undefined) continue

        updateIds.add(update.id)

        if (update.updated_datetime != null) {
            const t = new Date(update.updated_datetime).getTime()
            if (t < minUpdateTime) minUpdateTime = t
        }

        const cachedTime = cachedUpdatedAt.get(update.id)
        if (cachedTime == null) {
            needsFullRefetch = true
        } else if (
            update.updated_datetime != null &&
            new Date(update.updated_datetime).getTime() >
                new Date(cachedTime).getTime()
        ) {
            staleIds.add(update.id)
        }
    }

    // When the cache is within the API result limit, the response covers the
    // full window. Any cached ticket newer than the oldest update that's absent
    // from the response has left the view.
    if (!needsFullRefetch && cachedUpdatedAt.size <= MAX_API_RESULTS) {
        needsFullRefetch = [...cachedUpdatedAt.entries()].some(
            ([id, updatedAt]) =>
                !updateIds.has(id) &&
                updatedAt != null &&
                new Date(updatedAt).getTime() >= minUpdateTime,
        )
    }

    return { needsFullRefetch, staleIds }
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
                refetchInterval: DurationInMs.FiveSeconds,
                refetchIntervalInBackground: false,
                refetchOnWindowFocus: false,
                staleTime: DurationInMs.FiveSeconds,
                select: (response) => response.data.data,
            },
        },
    )

    useEffect(() => {
        if (!updates?.length) return

        const cached = queryClient.getQueryData<
            InfiniteData<{ data: Ticket[] }>
        >(queryKeys.views.listViewItems(viewId, params))
        if (!cached) return

        const cachedUpdatedAt = buildCachedTimestamps(cached)
        const { needsFullRefetch, staleIds } = diffUpdatesAgainstCache(
            updates,
            cachedUpdatedAt,
        )

        if (needsFullRefetch) {
            queryClient.invalidateQueries({
                queryKey: queryKeys.views.listViewItems(viewId, params),
            })
        } else if (staleIds.size > 0) {
            queryClient.invalidateQueries({
                queryKey: queryKeys.views.listViewItems(viewId, params),
                refetchPage: (page: { data: Array<{ id?: number }> }) =>
                    page.data.some(
                        (ticket) =>
                            ticket.id !== undefined && staleIds.has(ticket.id),
                    ),
            })
        }
    }, [updates, queryClient, viewId, params])
}
