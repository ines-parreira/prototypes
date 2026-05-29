import { useMemo } from 'react'

import type { AvatarStatusIndicatorColor } from '@gorgias/axiom'
import type { UserAvailabilityStatus } from '@gorgias/helpdesk-queries'

type UseIndicatorPropsParams = {
    isOnline: boolean
    availabilityStatus?: UserAvailabilityStatus
}

export type IndicatorProps = {
    color: AvatarStatusIndicatorColor
    'aria-label': string
}

export function useIndicatorProps({
    isOnline,
    availabilityStatus,
}: UseIndicatorPropsParams): IndicatorProps {
    return useMemo(() => {
        if (!isOnline) {
            return { color: 'grey', 'aria-label': 'Offline' }
        }

        if (availabilityStatus === 'available') {
            return { color: 'green', 'aria-label': 'Available' }
        }

        if (
            availabilityStatus === 'unavailable' ||
            availabilityStatus === 'custom'
        ) {
            return { color: 'orange', 'aria-label': 'Unavailable' }
        }

        return { color: 'green', 'aria-label': 'Online' }
    }, [isOnline, availabilityStatus])
}
