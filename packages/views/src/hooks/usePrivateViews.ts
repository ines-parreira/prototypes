import { useMemo } from 'react'

import type { View } from '@gorgias/helpdesk-types'

import { sortByDisplayOrder } from './sortByDisplayOrder'
import { useAllViews } from './useAllViews'
import { usePrivateViewsOrdering } from './usePrivateViewsOrdering'

export function usePrivateViews(): View[] {
    const views = useAllViews()
    const ordering = usePrivateViewsOrdering()

    return useMemo(
        () =>
            sortByDisplayOrder(
                views.filter((v) => v.visibility === 'private'),
                ordering.views,
            ),
        [views, ordering.views],
    )
}
