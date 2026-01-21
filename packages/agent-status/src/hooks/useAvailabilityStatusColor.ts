import { useMemo } from 'react'

import type { AvatarStatusIndicatorColor } from '@gorgias/axiom'
import type { UserAvailabilityStatus } from '@gorgias/helpdesk-queries'

export function useAvailabilityStatusColor(
    status: UserAvailabilityStatus,
): AvatarStatusIndicatorColor {
    return useMemo(() => {
        switch (status) {
            case 'available':
                return 'green'
            case 'unavailable':
                return 'red'
            case 'custom':
                return 'orange'
            default:
                return 'green'
        }
    }, [status])
}
