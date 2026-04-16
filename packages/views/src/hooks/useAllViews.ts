import { useListAllViews } from '@gorgias/helpdesk-queries'
import type { View } from '@gorgias/helpdesk-types'

import { VIEWS_STALE_TIME } from '../constants'

export function useAllViews(): View[] {
    const { items } = useListAllViews(
        { limit: 100 },
        {
            exhaustPages: true,
            query: {
                staleTime: VIEWS_STALE_TIME,
                refetchOnWindowFocus: false,
            },
        },
    )

    return items
}
