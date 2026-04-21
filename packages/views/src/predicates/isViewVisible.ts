import type { View } from '@gorgias/helpdesk-types'

import { getExpandedSectionIds } from '../store/viewsCountStore'
import { isViewUrl } from '../utils/url'

export function isViewVisible(view: View): boolean {
    if (!isViewUrl()) return false

    const expandedKeys = getExpandedSectionIds()
    if (!expandedKeys) return true

    const categoryKey = view.visibility === 'private' ? 'private' : 'public'
    if (!expandedKeys.includes(categoryKey)) return false

    if (view.section_id) {
        return expandedKeys.includes(`section-${view.section_id}`)
    }

    return true
}
