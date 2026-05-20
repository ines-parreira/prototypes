import { appQueryClient } from '@repo/api-resources'
import { useIsFetching } from '@tanstack/react-query'

import { queryKeys, useListAllViews } from '@gorgias/helpdesk-queries'

import { VIEWS_STALE_TIME } from '../constants'
import type { AllViewsQueryData } from './allViewsQuery'
import { ALL_VIEWS_QUERY_PARAMS } from './allViewsQuery'
import { SYSTEM_VIEWS_QUERY_PARAMS } from './useSystemViews'

/**
 * Returns `true` once every view-list query read by `getAllViewsOrdered()` has
 * loaded in the React Query cache. The scheduler's takeover scan reads these
 * caches synchronously, so this hook owns both loading and readiness checks.
 *
 * The unfiltered query is exhausted across pages. System views are fetched
 * separately because the sidebar stores them under `category=system`.
 */
export function useAllViewsLoaded(): boolean {
    useListAllViews(ALL_VIEWS_QUERY_PARAMS, {
        query: {
            staleTime: VIEWS_STALE_TIME,
            refetchOnWindowFocus: false,
        },
        exhaustPages: true,
    })
    useListAllViews(SYSTEM_VIEWS_QUERY_PARAMS, {
        query: {
            staleTime: VIEWS_STALE_TIME,
            refetchOnWindowFocus: false,
        },
    })

    const allViewsLoaded = useViewsQueryLoaded(ALL_VIEWS_QUERY_PARAMS)
    const systemViewsLoaded = useViewsQueryLoaded(SYSTEM_VIEWS_QUERY_PARAMS)

    return allViewsLoaded && systemViewsLoaded
}

function useViewsQueryLoaded(
    queryParams:
        | typeof ALL_VIEWS_QUERY_PARAMS
        | typeof SYSTEM_VIEWS_QUERY_PARAMS,
): boolean {
    const queryKey = queryKeys.views.listAllViews(queryParams)
    const fetchingCount = useIsFetching({ queryKey })
    if (fetchingCount > 0) return false

    const data = appQueryClient.getQueryData<AllViewsQueryData>(queryKey)
    if (!data?.pages?.length) return false
    const lastPage = data.pages[data.pages.length - 1]
    return lastPage.data.meta?.next_cursor == null
}
