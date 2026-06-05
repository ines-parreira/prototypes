import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { USERS_PERFORMANCE_OVERVIEW } from 'domains/reporting/config/stats'
import { defaultQueryOptions } from 'domains/reporting/models/queries'
import { fetchStat } from 'domains/reporting/models/stat/resources'
import type {
    LegacyStatsFilters,
    Stat,
    StatData,
} from 'domains/reporting/models/stat/types'

const LIVE_AGENTS_STATS_QUERY_KEY = 'live-agents-data-table-stats'

type UseLiveAgentsStatsParams = {
    userIds: number[]
    filters: LegacyStatsFilters
}

type UseLiveAgentsStatsResult = {
    stat: Stat<StatData> | null
    isFetching: boolean
}

/**
 * Fetches the `users-performance-overview` stat for the given agents in a single
 * request. Callers pass the full (already-loaded) agent list, so every agent has
 * metrics and the metric columns can be sorted across the whole dataset.
 * Only the channels filter / period change the query key — pagination, sorting
 * and search are all client-side — so navigating never refetches. The sorted
 * ids keep the key stable regardless of the agents' order.
 */
export function useLiveAgentsStats({
    userIds,
    filters,
}: UseLiveAgentsStatsParams): UseLiveAgentsStatsResult {
    const sortedUserIds = useMemo(
        () => [...userIds].sort((a, b) => a - b),
        [userIds],
    )

    const { data, isFetching } = useQuery({
        // Align retry / staleTime / refetch behaviour with the rest of the
        // reporting domain instead of hand-rolling query options.
        ...defaultQueryOptions,
        queryKey: [LIVE_AGENTS_STATS_QUERY_KEY, sortedUserIds, filters],
        queryFn: ({ signal }) =>
            fetchStat(
                USERS_PERFORMANCE_OVERVIEW,
                { filters: { ...filters, agents: sortedUserIds } },
                { signal },
            ),
        enabled: sortedUserIds.length > 0,
        keepPreviousData: true,
    })

    return { stat: data ?? null, isFetching }
}
