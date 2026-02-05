import type { QueryClient } from '@tanstack/react-query'

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

    return { previousData, newData }
}
