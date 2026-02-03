import type { QueryClient } from '@tanstack/react-query'

import type { UpdateUserAvailabilityAsUser } from '@gorgias/helpdesk-queries'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type {
    GetUserAvailabilityResult,
    UserAvailabilityDetail,
} from '@gorgias/helpdesk-types'

type UpdateUserAvailabilityVariables = {
    userId: number
    data: UpdateUserAvailabilityAsUser
}

export const updateUserAvailabilityInCache = (
    client: QueryClient,
    variables: UpdateUserAvailabilityVariables,
) => {
    const previousData = client.getQueryData(
        queryKeys.userAvailability.getUserAvailability(variables.userId),
    ) as GetUserAvailabilityResult

    const patchedData: UserAvailabilityDetail = {
        user_status: variables.data.user_status,
        custom_user_availability_status_id:
            variables.data.custom_user_availability_status_id,
        user_id: variables.userId,
    }

    const newData: GetUserAvailabilityResult = {
        ...previousData,
        data: patchedData,
    }

    client.setQueryData(
        queryKeys.userAvailability.getUserAvailability(variables.userId),
        newData,
    )

    return { previousData, newData }
}
