import { useMemo } from 'react'

import { useUserDateTimePreferences } from '@repo/user'

import type { UserAvailability } from '@gorgias/helpdesk-types'

import { formatExpirationTime } from '../utils/formatExpirationTime'

export function useUserAvailabilityExpirationTime(
    expiresAt: UserAvailability['custom_user_availability_status_expires_datetime'],
): string | undefined {
    const { dateFormat, timeFormat, timezone } = useUserDateTimePreferences()

    return useMemo(() => {
        if (!expiresAt) {
            return undefined
        }

        return formatExpirationTime(expiresAt, dateFormat, timeFormat, timezone)
    }, [expiresAt, dateFormat, timeFormat, timezone])
}
