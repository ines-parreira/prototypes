import { useMemo } from 'react'

import type { View } from '@gorgias/helpdesk-types'

import { sortByDisplayOrder } from './sortByDisplayOrder'
import { useAllViews } from './useAllViews'
import { usePublicViewsOrdering } from './usePublicViewsOrdering'

export function usePublicViews(): View[] {
    const views = useAllViews()
    const ordering = usePublicViewsOrdering()

    return useMemo(
        () =>
            sortByDisplayOrder(
                views.filter(
                    (v) =>
                        v.visibility !== 'private' && v.category !== 'system',
                ),
                ordering.views,
            ),
        [views, ordering.views],
    )
}
