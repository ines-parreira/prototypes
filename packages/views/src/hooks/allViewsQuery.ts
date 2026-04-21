import type { InfiniteData } from '@tanstack/react-query'

import type { ListViewsResult, View } from '@gorgias/helpdesk-types'

export const ALL_VIEWS_QUERY_PARAMS = { limit: 100 } as const

export type AllViewsQueryData = InfiniteData<ListViewsResult>

export function getAllViewsFromQueryData(
    data: AllViewsQueryData | undefined,
): View[] {
    return data?.pages?.flatMap((page) => page.data.data ?? []) ?? []
}
