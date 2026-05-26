import { useCallback, useMemo } from 'react'

import { patchInfiniteListCache } from '@repo/api-resources'
import { useQueryClient } from '@tanstack/react-query'

import { isDomainEvent } from '@gorgias/events'
import type { DomainEvent } from '@gorgias/events'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type { UserAvailability } from '@gorgias/helpdesk-queries'
import { useAccountId, useChannel } from '@gorgias/realtime'
import type { ChannelNameOptions } from '@gorgias/realtime'

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

/**
 * Subscribes to the account-level realtime channel and keeps the user
 * availability list cache in sync with `user-availability.created` and
 * `user-availability.updated` events.
 *
 * Renders nothing on its own — mount this once somewhere stable in the tree
 * (e.g. a root-level provider that does not re-render often) and consumers
 * that read the cache via `useListAllUserAvailabilities` (including
 * `useUserStatus`) will pick up changes automatically.
 */
export function useUserAvailabilityRealtimeUpdates(): void {
    const accountId = useAccountId()
    const queryClient = useQueryClient()

    const channel = useMemo<ChannelNameOptions | undefined>(() => {
        if (!accountId) return undefined
        return { name: 'account', accountId }
    }, [accountId])

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

    useChannel({ channel, onEvent })
}
