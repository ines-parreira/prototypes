import {useCallback} from 'react'
import {
    HttpResponse,
    ListSlaPolicies200,
    useListSlaPolicies,
} from '@gorgias/api-queries'

import {UISLAPolicy} from '../types'

import makeUISLAPolicy from './makeUISLAPolicy'

export const STALE_TIME_MS = 5 * 60 * 1000 // 5 minutes
export const CACHE_TIME_MS = 20 * 60 * 1000 // 20 minutes

export default function useGetSLAPolicies() {
    const transformData = useCallback(
        (data: HttpResponse<ListSlaPolicies200>) =>
            data?.data?.data
                .map<UISLAPolicy>(makeUISLAPolicy)
                .sort((a, b) => b.priority - a.priority),
        []
    )

    return useListSlaPolicies(undefined, {
        query: {
            select: transformData,
            staleTime: STALE_TIME_MS,
            cacheTime: CACHE_TIME_MS,
        },
    })
}
