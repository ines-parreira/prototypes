import type { View } from '@gorgias/helpdesk-types'

export function isViewDeactivated(view: View): boolean {
    return !!view.deactivated_datetime
}
