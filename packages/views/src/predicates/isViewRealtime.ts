import type { View } from '@gorgias/helpdesk-types'

export function isViewRealtime(view: View): boolean {
    if (!view.filters) return false
    return REALTIME_CHANNEL_PATTERN.test(view.filters)
}

const REALTIME_CHANNEL_PATTERN = /ticket\.channel.*["']chat["']/
