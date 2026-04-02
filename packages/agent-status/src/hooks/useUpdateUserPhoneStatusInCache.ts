import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { GetUserPhoneStatusResult } from '@gorgias/helpdesk-queries'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type { UserPhoneStatus } from '@gorgias/helpdesk-types'

export const useUpdateUserPhoneStatusInCache = () => {
    const client = useQueryClient()

    return useCallback(
        (data: UserPhoneStatus) => {
            const previousData = client.getQueryData(
                queryKeys.voiceUserStatus.getUserPhoneStatus(data.user_id),
            ) as GetUserPhoneStatusResult

            const newData: GetUserPhoneStatusResult['data'] = {
                ...previousData,
                ...data,
            }

            client.setQueryData(
                queryKeys.voiceUserStatus.getUserPhoneStatus(data.user_id),
                // since on the other end we have select (data) => data.data,
                // we need to wrap the data in a data object
                // to match the expected shape
                { data: newData },
            )

            return {
                previousData,
                newData,
            }
        },
        [client],
    )
}
