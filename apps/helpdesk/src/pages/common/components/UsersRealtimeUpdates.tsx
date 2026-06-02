import {
    UserRealtimeAvailabilityUpdates as LegacyCurrentUserRealtimeAvailabilityUpdates,
    useCustomAgentUnavailableStatusesFlag,
} from '@repo/agent-status'
import { useUsersRealtimeUpdates } from '@repo/users'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUserId } from 'state/currentUser/selectors'

/**
 * Mount-once subscriber that keeps the account-wide user caches in sync with
 * realtime events on the account-level channel: user availability
 * (`useUserStatus` / `useListAllUserAvailabilities`) and the users list
 * (`useAllUsers`).
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
 * <UsersRealtimeUpdates />
 * ```
 */
export function UsersRealtimeUpdates(): JSX.Element | null {
    useUsersRealtimeUpdates()

    const isLegacyFeatureEnabled = useCustomAgentUnavailableStatusesFlag()
    const currentUserId = useAppSelector(getCurrentUserId)

    if (!isLegacyFeatureEnabled || !currentUserId) {
        return null
    }

    return (
        <LegacyCurrentUserRealtimeAvailabilityUpdates userId={currentUserId} />
    )
}
