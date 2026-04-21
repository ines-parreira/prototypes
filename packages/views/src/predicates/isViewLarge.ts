import type { View } from '@gorgias/helpdesk-types'

import { DEFAULT_REFRESH_CONFIG } from '../scheduler/selectViewsToRefresh'
import { viewsCountStore } from '../store/viewsCountStore'

export function isViewLarge(view: View): boolean {
    const entry = viewsCountStore.getState().counts[view.id]
    return (entry?.count ?? 0) >= DEFAULT_REFRESH_CONFIG.largeCountThreshold
}
