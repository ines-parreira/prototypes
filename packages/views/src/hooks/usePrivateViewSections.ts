import { useMemo } from 'react'

import type { ViewSection } from '../types'
import { sortByDisplayOrder } from './sortByDisplayOrder'
import { useAllViewSections } from './useAllViewSections'
import { usePrivateViewsOrdering } from './usePrivateViewsOrdering'

export function usePrivateViewSections(): ViewSection[] {
    const sections = useAllViewSections()
    const ordering = usePrivateViewsOrdering()

    return useMemo(
        () =>
            sortByDisplayOrder(
                sections.filter((s) => s.private),
                ordering.view_sections,
            ),
        [sections, ordering.view_sections],
    )
}
