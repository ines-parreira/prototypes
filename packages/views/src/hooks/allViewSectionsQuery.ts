import type { InfiniteData } from '@tanstack/react-query'

import type { ListViewSectionsResult } from '@gorgias/helpdesk-types'

import type { ViewSection } from '../types'

export const ALL_VIEW_SECTIONS_QUERY_PARAMS = { limit: 100 } as const

export type AllViewSectionsQueryData = InfiniteData<ListViewSectionsResult>

export function getAllViewSectionsFromQueryData(
    data: AllViewSectionsQueryData | undefined,
): ViewSection[] {
    return data?.pages?.flatMap((page) => page.data.data ?? []) ?? []
}
