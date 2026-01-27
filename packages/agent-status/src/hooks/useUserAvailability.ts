import { useMemo } from 'react'

import type { UserAvailability } from '@gorgias/helpdesk-queries'
import { useGetUserAvailability } from '@gorgias/helpdesk-queries'

type UseUserAvailabilityParams = {
    userId: number
}

export const useUserAvailability = ({ userId }: UseUserAvailabilityParams) => {
    const { data, isLoading, isError, error } = useGetUserAvailability(userId, {
        query: {
            enabled: !!userId,
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
        availability,
        activeStatusId,
        isLoading,
        isError,
        error,
    }
}
