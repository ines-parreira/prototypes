import type { View } from '@gorgias/helpdesk-types'

import { DEFAULT_REFRESH_CONFIG } from '../scheduler/selectViewsToRefresh'
import { viewsCountStore } from '../store/viewsCountStore'

export function isViewRecentlyViewed(view: View): boolean {
    const entry = viewsCountStore.getState().counts[view.id]
    if (!entry?.lastViewedAt) return false
    const viewedAge =
        (Date.now() - new Date(entry.lastViewedAt).getTime()) / 1000
    return viewedAge <= DEFAULT_REFRESH_CONFIG.recentlyActiveWindowSeconds
}
