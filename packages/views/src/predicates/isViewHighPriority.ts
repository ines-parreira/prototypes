import type { View } from '@gorgias/helpdesk-types'

export function isViewHighPriority(view: View): boolean {
    return !!view.name && HIGH_PRIORITY_VIEW_NAMES.has(view.name)
}

const HIGH_PRIORITY_VIEW_NAMES = new Set(['Inbox', 'Unassigned', 'All'])
