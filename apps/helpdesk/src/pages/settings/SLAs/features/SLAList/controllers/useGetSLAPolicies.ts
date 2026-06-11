import { useCallback } from 'react'
import { Duration } from '@gorgias/toolkit'

import type {
    HttpResponse,
    ListSlaPolicies200,
} from '@gorgias/helpdesk-queries'
import { useListSlaPolicies } from '@gorgias/helpdesk-queries'

import type { UISLAPolicy } from '../types'
import { makeUISLAPolicy } from './makeUISLAPolicy'

export const STALE_TIME_MS = Duration.minutes(5)
export const CACHE_TIME_MS = Duration.minutes(20)

export function useGetSLAPolicies() {
    const transformData = useCallback(
        (data: HttpResponse<ListSlaPolicies200>) =>
            data?.data?.data
                .map<UISLAPolicy>(makeUISLAPolicy)
                .sort((a, b) => a.priority - b.priority),
        [],
    )

    return useListSlaPolicies(undefined, {
        query: {
            select: transformData,
            staleTime: STALE_TIME_MS,
            cacheTime: CACHE_TIME_MS,
        },
    })
}
