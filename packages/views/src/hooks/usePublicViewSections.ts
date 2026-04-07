import { useMemo } from 'react'

import type { ViewSection } from '../types'
import { sortByDisplayOrder } from './sortByDisplayOrder'
import { useAllViewSections } from './useAllViewSections'
import { usePublicViewsOrdering } from './usePublicViewsOrdering'

export function usePublicViewSections(): ViewSection[] {
    const sections = useAllViewSections()
    const ordering = usePublicViewsOrdering()

    return useMemo(
        () =>
            sortByDisplayOrder(
                sections.filter((s) => !s.private),
                ordering.view_sections,
            ),
        [sections, ordering.view_sections],
    )
}
