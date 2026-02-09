import { useMemo } from 'react'

import type { AvatarStatusIndicatorColor } from '@gorgias/axiom'
import type { UserAvailabilityStatus } from '@gorgias/helpdesk-queries'

import type { AgentStatusWithSystem } from '../types'

export function useAvailabilityStatusColor(
    status?: UserAvailabilityStatus,
    phoneStatus?: AgentStatusWithSystem['id'],
): AvatarStatusIndicatorColor | undefined {
    return useMemo(() => {
        if (phoneStatus) {
            return 'red'
        }

        if (!status) {
            return undefined
        }

        if (status === 'available') {
            return 'green'
        }

        return 'orange'
    }, [status, phoneStatus])
}
