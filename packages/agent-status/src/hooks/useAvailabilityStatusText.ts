import { useMemo } from 'react'

import type { UserAvailability } from '@gorgias/helpdesk-queries'

import type { AgentStatusWithSystem } from '../types'

function formatTime(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    })
}

export function useAvailabilityStatusText(
    userAvailability: UserAvailability | undefined,
    customStatus: AgentStatusWithSystem | undefined,
): string | undefined {
    return useMemo(() => {
        if (!userAvailability) {
            return undefined
        }

        if (userAvailability.user_status !== 'custom') {
            return userAvailability.user_status === 'available'
                ? 'Available'
                : 'Unavailable'
        }

        if (!customStatus) {
            return undefined
        }

        const expiresAt =
            userAvailability.custom_user_availability_status_expires_datetime

        if (!expiresAt) {
            return customStatus.name
        }

        const formattedTime = formatTime(expiresAt)
        return `${customStatus.name} until ${formattedTime}`
    }, [userAvailability, customStatus])
}
