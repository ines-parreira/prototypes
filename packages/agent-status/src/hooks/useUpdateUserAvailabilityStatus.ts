import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { UserAvailabilityStatus } from '@gorgias/helpdesk-queries'
import { queryKeys, useUpdateUserAvailability } from '@gorgias/helpdesk-queries'

import { buildUpdateData } from '../utils/buildUpdateData'

export const useUpdateUserAvailabilityStatus = () => {
    const client = useQueryClient()
    const { mutateAsync, ...rest } = useUpdateUserAvailability({
        mutation: {
            onSuccess: (_data, variables) => {
                client.invalidateQueries(
                    queryKeys.userAvailability.getUserAvailability(
                        variables.userId,
                    ),
                )
            },
        },
    })

    const updateStatusAsync = useCallback(
        async (userId: number, statusId: UserAvailabilityStatus | string) => {
            const data = buildUpdateData(statusId)

            return mutateAsync({
                userId,
                data,
            })
        },
        [mutateAsync],
    )

    return {
        updateStatusAsync,
        ...rest,
    }
}
