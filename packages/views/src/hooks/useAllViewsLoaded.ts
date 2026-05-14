import { appQueryClient } from '@repo/api-resources'
import { useIsFetching } from '@tanstack/react-query'

import { queryKeys } from '@gorgias/helpdesk-queries'

import type { AllViewsQueryData } from './allViewsQuery'
import { ALL_VIEWS_QUERY_PARAMS } from './allViewsQuery'

/**
 * Returns `true` once the paginated views list has fully loaded in the React
 * Query cache — no fetch is in flight and the last page's cursor is `null`.
 * Callers that need the complete view set (e.g. the v3 scheduler's bulk
 * fetch-all) should gate on this so they don't act on a partial list and
 * stamp `lastFetchAllAt` early.
 *
 * Subscribes only to fetching state via `useIsFetching` — does not trigger
 * the query itself or duplicate `useListAllViews`'s options.
 */
export function useAllViewsLoaded(): boolean {
    const queryKey = queryKeys.views.listAllViews(ALL_VIEWS_QUERY_PARAMS)
    const fetchingCount = useIsFetching({ queryKey })
    if (fetchingCount > 0) return false

    const data = appQueryClient.getQueryData<AllViewsQueryData>(queryKey)
    if (!data?.pages?.length) return false
    const lastPage = data.pages[data.pages.length - 1]
    return lastPage.data.meta?.next_cursor == null
}
