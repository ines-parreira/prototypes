import { useListAllViewSections } from '@gorgias/helpdesk-queries'

import { VIEWS_STALE_TIME } from '../constants'
import type { ViewSection } from '../types'

export function useAllViewSections(): ViewSection[] {
    const { items } = useListAllViewSections(
        { limit: 100 },
        {
            query: {
                staleTime: VIEWS_STALE_TIME,
                refetchOnWindowFocus: false,
            },
        },
    )

    return items
}
