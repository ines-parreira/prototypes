import {
    UserRealtimeAvailabilityUpdates as LegacyCurrentUserRealtimeAvailabilityUpdates,
    useCustomAgentUnavailableStatusesFlag,
} from '@repo/agent-status'
import { useUserAvailabilityRealtimeUpdates } from '@repo/users'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUserId } from 'state/currentUser/selectors'

/**
 * Mount-once subscriber that keeps the user availability list cache in sync
 * with realtime events on the account-level channel. Consumers read the cache
 * via `useUserStatus` (or `useListAllUserAvailabilities` directly).
 *
 * Also still mounts the legacy per-user subscription from `@repo/agent-status`
 * for the current user so consumers reading the legacy cache keep receiving
 * updates until they migrate.
 *
 * Rendered as a child of `Main`, so it sits inside `RealtimeProvider` and
 * `QueryClientProvider` without re-rendering on route changes.
 *
 * @example
 * ```tsx
 * <UserAvailabilityRealtimeUpdates />
 * ```
 */
export function UserAvailabilityRealtimeUpdates(): JSX.Element | null {
    useUserAvailabilityRealtimeUpdates()

    const isLegacyFeatureEnabled = useCustomAgentUnavailableStatusesFlag()
    const currentUserId = useAppSelector(getCurrentUserId)

    if (!isLegacyFeatureEnabled || !currentUserId) {
        return null
    }

    return (
        <LegacyCurrentUserRealtimeAvailabilityUpdates userId={currentUserId} />
    )
}
