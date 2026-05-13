import { useMemo } from 'react'

import type { View } from '@gorgias/helpdesk-types'

import { getAllViews } from '../store/viewStore'
import { sortByDisplayOrder } from './sortByDisplayOrder'
import { useAllViews } from './useAllViews'
import {
    getPrivateViewsOrdering,
    usePrivateViewsOrdering,
} from './usePrivateViewsOrdering'

export function usePrivateViews(): View[] {
    const views = useAllViews()
    const ordering = usePrivateViewsOrdering()

    return useMemo(
        () => selectPrivateViews(views, ordering.views),
        [views, ordering.views],
    )
}

/**
 * Non-hook variant: reads from the same React Query caches as
 * `usePrivateViews` and applies the identical filter + ordering.
 */
export function getPrivateViews(): View[] {
    const ordering = getPrivateViewsOrdering()
    return selectPrivateViews(getAllViews(), ordering.views)
}

function selectPrivateViews(
    views: View[],
    orderingMap: Record<string, { display_order: number }>,
): View[] {
    return sortByDisplayOrder(
        views.filter((v) => v.visibility === 'private'),
        orderingMap,
    )
}
