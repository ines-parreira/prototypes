import { useMemo } from 'react'

import type { View } from '@gorgias/helpdesk-types'

import { sortByDisplayOrder } from './sortByDisplayOrder'
import { useAllViews } from './useAllViews'
import { usePrivateViewsOrdering } from './usePrivateViewsOrdering'
import { usePublicViewsOrdering } from './usePublicViewsOrdering'

export function useSectionViews(sectionId: number): View[] {
    const views = useAllViews()
    const publicOrdering = usePublicViewsOrdering()
    const privateOrdering = usePrivateViewsOrdering()

    return useMemo(() => {
        const sectionViews = views.filter((v) => v.section_id === sectionId)

        const ordering =
            sectionViews[0]?.visibility === 'private'
                ? privateOrdering
                : publicOrdering

        return sortByDisplayOrder(sectionViews, ordering.views)
    }, [views, sectionId, publicOrdering, privateOrdering])
}
