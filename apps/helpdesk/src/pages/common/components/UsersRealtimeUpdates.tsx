import { useUsersRealtimeUpdates } from '@repo/users'

/**
 * Mount-once subscriber that keeps the account-wide user caches in sync with
 * realtime events on the account-level channel: user availability
 * (`useUserStatus` / `useUserAvailability` / `useListAllUserAvailabilities`)
 * and the users list (`useAllUsers`).
 *
 * Rendered as a child of `Main`, so it sits inside `RealtimeProvider` and
 * `QueryClientProvider` without re-rendering on route changes.
 *
 * @example
 * ```tsx
 * <UsersRealtimeUpdates />
 * ```
 */
export function UsersRealtimeUpdates(): null {
    useUsersRealtimeUpdates()

    return null
}
