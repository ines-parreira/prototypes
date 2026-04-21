import { useListAllViews } from '@gorgias/helpdesk-queries'
import type { View } from '@gorgias/helpdesk-types'

import { VIEWS_STALE_TIME } from '../constants'
import {
    ALL_VIEWS_QUERY_PARAMS,
    getAllViewsFromQueryData,
} from './allViewsQuery'

export function useAllViews(): View[] {
    const { data } = useListAllViews(ALL_VIEWS_QUERY_PARAMS, {
        query: {
            staleTime: VIEWS_STALE_TIME,
            refetchOnWindowFocus: false,
        },
        exhaustPages: true,
    })

    return getAllViewsFromQueryData(data)
}
