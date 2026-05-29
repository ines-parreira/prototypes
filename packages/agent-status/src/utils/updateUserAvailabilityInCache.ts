import type { QueryClient } from '@tanstack/react-query'

import { patchInfiniteListCache } from '@repo/api-resources'
import type { UserAvailability } from '@gorgias/helpdesk-queries'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type {
    GetUserAvailabilityResult,
    UserAvailabilityDetail,
} from '@gorgias/helpdesk-types'

export const updateUserAvailabilityInCache = (
    client: QueryClient,
    data: UserAvailabilityDetail,
) => {
    const previousData = client.getQueryData(
        queryKeys.userAvailability.getUserAvailability(data.user_id),
    ) as GetUserAvailabilityResult

    const newData: GetUserAvailabilityResult = {
        ...previousData,
        data,
    }

    client.setQueryData(
        queryKeys.userAvailability.getUserAvailability(data.user_id),
        newData,
    )

    patchInfiniteListCache<UserAvailability>({
        queryClient: client,
        queryKey: queryKeys.userAvailability.listAllUserAvailabilities(),
        match: (item) => item.user_id === data.user_id,
        patch: (existing) => ({
            ...existing,
            user_status: data.user_status,
            custom_user_availability_status_id:
                data.custom_user_availability_status_id ??
                existing.custom_user_availability_status_id,
            custom_user_availability_status_expires_datetime:
                data.custom_user_availability_status_expires_datetime ??
                existing.custom_user_availability_status_expires_datetime,
            updated_datetime:
                data.updated_datetime ?? existing.updated_datetime,
        }),
    })

    return { previousData, newData }
}
