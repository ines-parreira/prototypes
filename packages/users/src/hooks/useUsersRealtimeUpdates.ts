import { useCallback, useMemo } from 'react'

import {
    patchInfiniteListCache,
    removeFromInfiniteListCache,
} from '@repo/api-resources'
import { isRecord } from '@repo/utils'
import type { InfiniteData } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'

import { isDomainEvent } from '@gorgias/events'
import type { DomainEvent } from '@gorgias/events'
import { getUser } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type { User, UserAvailability } from '@gorgias/helpdesk-queries'
import { useAccountId, useChannel } from '@gorgias/realtime'
import type { ChannelNameOptions, UseChannelProps } from '@gorgias/realtime'

const USER_CREATED_EVENT = 'user.created'
const USER_DELETED_EVENT = 'user.deleted'

const USER_AVAILABILITY_STATUSES = [
    'available',
    'unavailable',
    'custom',
] as const

type UserAvailabilityStatus = UserAvailability['user_status']

function isUserAvailabilityStatus(
    value: string | null | undefined,
): value is UserAvailabilityStatus {
    return (USER_AVAILABILITY_STATUSES as readonly string[]).includes(
        value ?? '',
    )
}

type UserAvailabilityEventData = {
    user_id: number
    user_status: string
    updated_datetime: string
    custom_user_availability_status_id: string | null
    custom_user_availability_status_expires_datetime: string | null
    next_user_status: string | null
    next_custom_user_availability_status_id: string | null
    set_by_user_id: number | null
}

function toUserAvailability(
    data: UserAvailabilityEventData,
): UserAvailability | undefined {
    if (!isUserAvailabilityStatus(data.user_status)) return undefined

    return {
        user_id: data.user_id,
        user_status: data.user_status,
        updated_datetime: data.updated_datetime,
        custom_user_availability_status_id:
            data.custom_user_availability_status_id,
        custom_user_availability_status_expires_datetime:
            data.custom_user_availability_status_expires_datetime,
        next_user_status: isUserAvailabilityStatus(data.next_user_status)
            ? data.next_user_status
            : null,
        next_custom_user_availability_status_id:
            data.next_custom_user_availability_status_id,
        set_by_user_id: data.set_by_user_id,
    }
}

type UsersListPage = { data: { data: User[] } }
type UsersListInfiniteCache = InfiniteData<UsersListPage>

function parseMessageData(data: unknown): Record<string, unknown> | undefined {
    if (typeof data === 'string') {
        try {
            const parsed: unknown = JSON.parse(data)
            return isRecord(parsed) ? parsed : undefined
        } catch {
            return undefined
        }
    }

    return isRecord(data) ? data : undefined
}

/**
 * Subscribes once to the account-level realtime channel and keeps the
 * account-wide user caches in sync:
 *
 * - **Availability** (`user-availability.created` / `.updated`): CloudEvent
 *   domain events handled via `onEvent`, patched into the user availability
 *   list cache read by `useUserStatus` / `useListAllUserAvailabilities`.
 * - **Lifecycle** (`user.created` / `user.deleted`): raw Ably messages
 *   (`{ name, data }`, not CloudEvents) handled via `onMessage`, patched into
 *   the `listAllUsers` infinite cache read by `useAllUsers`.
 *
 * The `user.created` payload only carries a partial user, so the full record
 * is fetched by id and inserted into (or refreshed in) the list. The fetch
 * is skipped when the list has not been loaded anywhere — the query fetches
 * naturally on next mount. `user.deleted` removes the entry by id with no
 * fetch.
 *
 * Renders nothing on its own — mount this once somewhere stable in the tree
 * (e.g. a root-level provider) and consumers reading the caches pick up
 * changes automatically.
 */
export function useUsersRealtimeUpdates(): void {
    const accountId = useAccountId()
    const queryClient = useQueryClient()

    const channel = useMemo<ChannelNameOptions | undefined>(() => {
        if (!accountId) return undefined
        return { name: 'account', accountId }
    }, [accountId])

    const usersListKey = queryKeys.users.listAllUsers()

    const onEvent = useCallback(
        (event: DomainEvent) => {
            if (
                !isDomainEvent(event, '//helpdesk/user-availability.created') &&
                !isDomainEvent(event, '//helpdesk/user-availability.updated')
            ) {
                return
            }

            const availability = toUserAvailability(event.data)
            if (!availability) return

            patchInfiniteListCache<UserAvailability>({
                queryClient,
                queryKey:
                    queryKeys.userAvailability.listAllUserAvailabilities(),
                match: (item) => item.user_id === availability.user_id,
                patch: () => availability,
                insert: availability,
            })
        },
        [queryClient],
    )

    const insertCreatedUser = useCallback(
        async (id: number): Promise<void> => {
            const cachedLists =
                queryClient.getQueriesData<UsersListInfiniteCache>({
                    queryKey: usersListKey,
                })

            const hasCachedList = cachedLists.some(
                ([, cache]) => cache?.pages?.length,
            )
            if (!hasCachedList) return

            const alreadyCached = cachedLists.some(([, cache]) =>
                cache?.pages?.some((page) =>
                    page.data.data.some((user) => user.id === id),
                ),
            )
            if (alreadyCached) return

            const response = await queryClient.fetchQuery({
                queryKey: queryKeys.users.getUser(id),
                queryFn: () => getUser(id),
            })

            const user = response.data
            if (!user) return

            patchInfiniteListCache<User>({
                queryClient,
                queryKey: usersListKey,
                match: (entry) => entry.id === id,
                patch: () => user,
                insert: user,
            })
        },
        [queryClient, usersListKey],
    )

    const onMessage = useCallback<NonNullable<UseChannelProps['onMessage']>>(
        (message) => {
            if (message.name === USER_CREATED_EVENT) {
                const data = parseMessageData(message.data)
                const id = data?.id
                if (typeof id !== 'number') return

                void insertCreatedUser(id)
                return
            }

            if (message.name === USER_DELETED_EVENT) {
                const data = parseMessageData(message.data)
                const id = data?.id
                if (typeof id !== 'number') return

                removeFromInfiniteListCache<User>({
                    queryClient,
                    queryKey: usersListKey,
                    match: (entry) => entry.id === id,
                })
            }
        },
        [insertCreatedUser, queryClient, usersListKey],
    )

    useChannel({ channel, onEvent, onMessage })
}
