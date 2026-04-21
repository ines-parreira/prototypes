import type { View } from '@gorgias/helpdesk-types'

export function isViewSystem(view: View): boolean {
    return view.category === 'system'
}
