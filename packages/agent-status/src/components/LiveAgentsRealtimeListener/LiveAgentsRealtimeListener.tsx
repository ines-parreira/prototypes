import { useMemo } from 'react'

import { useAccountId, useChannels } from '@gorgias/realtime'

import { useUserAvailabilityRealtimeHandler } from '../../hooks/useUserAvailabilityRealtimeHandler'
import { makeUserRealtimeChannels } from '../../utils/makeUserRealtimeChannel'

/**
 * Listens to realtime updates for multiple agents' availability.
 * Renders nothing - just subscribes to events.
 *
 * @param userIds - Array of user IDs to subscribe to
 *
 * @example
 * ```tsx
 * // Subscribe to live agents' availability updates
 * <LiveAgentsRealtimeListener userIds={[123, 456, 789]} />
 * ```
 */
export function LiveAgentsRealtimeListener({ userIds }: { userIds: number[] }) {
    const accountId = useAccountId()
    const onEvent = useUserAvailabilityRealtimeHandler()

    const channels = useMemo(() => {
        if (accountId && userIds.length > 0) {
            return makeUserRealtimeChannels(accountId, userIds)
        }
    }, [accountId, userIds])

    useChannels({ channels, onEvent })

    return null
}
