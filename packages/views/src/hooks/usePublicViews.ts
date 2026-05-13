import { useMemo } from 'react'

import type { View } from '@gorgias/helpdesk-types'

import { getAllViews } from '../store/viewStore'
import { sortByDisplayOrder } from './sortByDisplayOrder'
import { useAllViews } from './useAllViews'
import {
    getPublicViewsOrdering,
    usePublicViewsOrdering,
} from './usePublicViewsOrdering'

export function usePublicViews(): View[] {
    const views = useAllViews()
    const ordering = usePublicViewsOrdering()

    return useMemo(
        () => selectPublicViews(views, ordering.views),
        [views, ordering.views],
    )
}

/**
 * Non-hook variant: reads from the same React Query caches as
 * `usePublicViews` and applies the identical filter + ordering.
 */
export function getPublicViews(): View[] {
    const ordering = getPublicViewsOrdering()
    return selectPublicViews(getAllViews(), ordering.views)
}

function selectPublicViews(
    views: View[],
    orderingMap: Record<string, { display_order: number }>,
): View[] {
    return sortByDisplayOrder(
        views.filter(
            (v) => v.visibility !== 'private' && v.category !== 'system',
        ),
        orderingMap,
    )
}
