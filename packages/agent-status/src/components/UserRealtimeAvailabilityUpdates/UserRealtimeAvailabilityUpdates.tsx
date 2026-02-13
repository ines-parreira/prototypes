import { useMemo } from 'react'

import { useAccountId, useChannel } from '@gorgias/realtime-ably'

import { useUserAvailabilityRealtimeHandler } from '../../hooks/useUserAvailabilityRealtimeHandler'
import { makeUserRealtimeChannel } from '../../utils/makeUserRealtimeChannel'

/**
 * Listens to realtime updates for a specific user's availability.
 * Renders nothing - just subscribes to events.
 *
 * @param userId - The ID of the user to subscribe to
 *
 * @example
 * ```tsx
 * // Subscribe to current user's availability updates
 * <UserRealtimeAvailabilityUpdates userId={currentUser.id} />
 * ```
 */
export function UserRealtimeAvailabilityUpdates({
    userId,
}: {
    userId: number
}) {
    const accountId = useAccountId()
    const onEvent = useUserAvailabilityRealtimeHandler()

    const channel = useMemo(() => {
        if (!accountId) return undefined
        return makeUserRealtimeChannel(accountId, userId)
    }, [accountId, userId])

    useChannel({
        channel,
        onEvent,
    })

    return null
}
