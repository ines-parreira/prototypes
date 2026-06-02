import { useMemo } from 'react'

import type { UserAvailability } from '@gorgias/helpdesk-queries'

import { useAllUserAvailabilities } from './useAllUserAvailabilities'

/**
 * Resolves a single user's availability from the shared infinite-list cache
 * (`useAllUserAvailabilities`) rather than the per-user endpoint, so it reuses
 * the listing that is already kept fresh app-wide by realtime updates.
 */
export function useUserAvailability(
    userId: number | undefined,
): UserAvailability | undefined {
    const availabilities = useAllUserAvailabilities()

    return useMemo(
        () => availabilities.find((entry) => entry.user_id === userId),
        [availabilities, userId],
    )
}
