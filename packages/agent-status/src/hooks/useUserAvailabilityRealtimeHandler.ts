import { useCallback } from 'react'

import { isDomainEvent } from '@gorgias/events'
import type { UserAvailabilityStatus } from '@gorgias/helpdesk-types'
import type { UseChannelProps } from '@gorgias/realtime-ably'

import { useUpdateUserAvailabilityInCache } from './useUpdateUserAvailabilityInCache'

/**
 * Hook to handle user availability realtime events.
 *
 * @returns onEvent handler for useChannel/useChannels
 *
 * @example
 * ```tsx
 * const onEvent = useUserAvailabilityRealtimeHandler()
 * useChannel({ channel, onEvent })
 * ```
 */
export function useUserAvailabilityRealtimeHandler(): NonNullable<
    UseChannelProps['onEvent']
> {
    const updateUserAvailabilityInCache = useUpdateUserAvailabilityInCache()

    return useCallback(
        (event) => {
            if (
                isDomainEvent(event, '//helpdesk/user-availability.created') ||
                isDomainEvent(event, '//helpdesk/user-availability.updated')
            ) {
                updateUserAvailabilityInCache({
                    ...event.data,
                    user_status: event.data
                        .user_status as UserAvailabilityStatus,
                })
            }
        },
        [updateUserAvailabilityInCache],
    )
}
