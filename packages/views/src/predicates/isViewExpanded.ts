import type { View } from '@gorgias/helpdesk-types'

import { getExpandedSectionIds } from '../store/viewsCountStore'

export function isViewExpanded(view: View): boolean {
    if (!view.section_id) return true
    const expandedKeys = getExpandedSectionIds()
    if (!expandedKeys) return true
    return expandedKeys.includes(`section-${view.section_id}`)
}
