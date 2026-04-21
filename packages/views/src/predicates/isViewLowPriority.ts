import type { View } from '@gorgias/helpdesk-types'

export function isViewLowPriority(view: View): boolean {
    return !!view.name && LOW_PRIORITY_VIEW_NAMES.has(view.name)
}

const LOW_PRIORITY_VIEW_NAMES = new Set(['Trash', 'Spam'])
