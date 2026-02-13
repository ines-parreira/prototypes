import { useCallback } from 'react'

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
        ({ data, dataschema }) => {
            switch (dataschema) {
                case '//helpdesk/user-availability.created/1.0.1':
                case '//helpdesk/user-availability.updated/1.0.1': {
                    updateUserAvailabilityInCache({
                        ...data,
                        user_status: data.user_status as UserAvailabilityStatus,
                    })
                    break
                }
                default:
                    break
            }
        },
        [updateUserAvailabilityInCache],
    )
}
