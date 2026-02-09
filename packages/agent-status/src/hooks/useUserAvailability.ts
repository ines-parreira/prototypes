import { useMemo } from 'react'

import { DurationInMs } from '@repo/utils'

import type { UserAvailability } from '@gorgias/helpdesk-queries'
import { useGetUserAvailability } from '@gorgias/helpdesk-queries'

type UseUserAvailabilityParams = {
    userId: number
    staleTime?: number
    cacheTime?: number
    cacheOnly?: boolean
}

export const useUserAvailability = ({
    userId,
    staleTime = DurationInMs.OneMinute,
    cacheTime = DurationInMs.FiveMinutes,
    cacheOnly = false,
}: UseUserAvailabilityParams) => {
    const { data, ...rest } = useGetUserAvailability(userId, {
        query: {
            enabled: !!userId && !cacheOnly,
            staleTime: cacheOnly ? Infinity : staleTime,
            cacheTime,
        },
    })

    // TODO: On BE, the type is wrong, leave until that's fixed
    // in meantime, casting to correct (what should be, and is).
    const availability = useMemo(
        () => data?.data as unknown as UserAvailability | undefined,
        [data],
    )

    const activeStatusId = useMemo(() => {
        if (!availability) return undefined
        return availability.user_status === 'custom'
            ? availability.custom_user_availability_status_id
            : availability.user_status
    }, [availability])

    return {
        ...rest,
        availability,
        activeStatusId,
    }
}
