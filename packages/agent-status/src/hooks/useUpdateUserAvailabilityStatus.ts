import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { UserAvailabilityStatus } from '@gorgias/helpdesk-queries'
import { queryKeys, useUpdateUserAvailability } from '@gorgias/helpdesk-queries'

import { updateUserAvailabilityInCache } from '../utils'
import { buildUpdateData } from '../utils/buildUpdateData'

export const useUpdateUserAvailabilityStatus = () => {
    const client = useQueryClient()
    const { mutateAsync, ...rest } = useUpdateUserAvailability({
        mutation: {
            onMutate: async (variables) => {
                const queryKey = queryKeys.userAvailability.getUserAvailability(
                    variables.userId,
                )
                await client.cancelQueries({ queryKey })

                return updateUserAvailabilityInCache(client, {
                    ...variables.data,
                    user_id: variables.userId,
                })
            },
            onError: (_error, variables, context) => {
                if (context?.previousData) {
                    client.setQueryData(
                        queryKeys.userAvailability.getUserAvailability(
                            variables.userId,
                        ),
                        context.previousData,
                    )
                }
            },
            onSettled: (_data, _error, variables) => {
                client.invalidateQueries({
                    queryKey: queryKeys.userAvailability.getUserAvailability(
                        variables.userId,
                    ),
                })
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
