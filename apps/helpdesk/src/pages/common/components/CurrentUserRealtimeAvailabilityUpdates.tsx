import {
    useCustomAgentUnavailableStatusesFlag,
    UserRealtimeAvailabilityUpdates,
} from '@repo/agent-status'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUserId } from 'state/currentUser/selectors'

/**
 * Wrapper component that conditionally renders UserRealtimeAvailabilityUpdates
 * based on the CustomAgentUnavailableStatuses feature flag and current user ID.
 *
 * Returns null if:
 * - Feature flag is disabled
 * - Current user ID is not available
 *
 * Otherwise renders UserRealtimeAvailabilityUpdates for the current user.
 *
 * @example
 * ```tsx
 * // Usage in Root.tsx or top-level component
 * <CurrentUserRealtimeAvailabilityUpdates />
 * ```
 */
export function CurrentUserRealtimeAvailabilityUpdates() {
    const isFeatureEnabled = useCustomAgentUnavailableStatusesFlag()
    const currentUserId = useAppSelector(getCurrentUserId)

    if (!isFeatureEnabled || !currentUserId) {
        return null
    }

    return <UserRealtimeAvailabilityUpdates userId={currentUserId} />
}
