import { useListAllViewSections } from '@gorgias/helpdesk-queries'

import { VIEWS_STALE_TIME } from '../constants'
import type { ViewSection } from '../types'
import {
    ALL_VIEW_SECTIONS_QUERY_PARAMS,
    getAllViewSectionsFromQueryData,
} from './allViewSectionsQuery'

export function useAllViewSections(): ViewSection[] {
    const { data } = useListAllViewSections(ALL_VIEW_SECTIONS_QUERY_PARAMS, {
        query: {
            staleTime: VIEWS_STALE_TIME,
            refetchOnWindowFocus: false,
        },
        exhaustPages: true,
    })

    return getAllViewSectionsFromQueryData(data)
}
