import type { View } from '@gorgias/helpdesk-types'

import { DEFAULT_REFRESH_CONFIG } from '../scheduler/selectViewsToRefresh'
import { viewsCountStore } from '../store/viewsCountStore'

export function isViewStale(view: View): boolean {
    const entry = viewsCountStore.getState().counts[view.id]
    if (!entry?.lastFetchedAt) return true
    const fetchedAge =
        (Date.now() - new Date(entry.lastFetchedAt).getTime()) / 1000
    return fetchedAge >= DEFAULT_REFRESH_CONFIG.staleSeconds
}
