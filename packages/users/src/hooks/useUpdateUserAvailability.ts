import { useCallback } from 'react'

import { patchInfiniteListCache } from '@repo/api-resources'
import { useQueryClient } from '@tanstack/react-query'

import {
    queryKeys,
    useUpdateUserAvailability as useUpdateUserAvailabilityPrimitive,
} from '@gorgias/helpdesk-queries'
import type {
    UpdateUserAvailabilityAsUser,
    UserAvailability,
    UserAvailabilityStatus,
} from '@gorgias/helpdesk-queries'

export function useUpdateUserAvailability(
    userId: number,
): UseUpdateUserAvailabilityReturn {
    const queryClient = useQueryClient()

    const { mutateAsync, ...rest } = useUpdateUserAvailabilityPrimitive({
        mutation: {
            onSuccess: (response) => {
                const updated = response.data
                patchInfiniteListCache<UserAvailability>({
                    queryClient,
                    queryKey:
                        queryKeys.userAvailability.listAllUserAvailabilities(),
                    match: (item) => item.user_id === updated.user_id,
                    patch: () => updated,
                })
            },
            onSettled: () => {
                queryClient.invalidateQueries({
                    queryKey:
                        queryKeys.userAvailability.getUserAvailability(userId),
                })
                queryClient.invalidateQueries({
                    queryKey:
                        queryKeys.userAvailability.listAllUserAvailabilities(),
                })
            },
        },
    })

    const update = useCallback(
        (status: UserAvailabilityStatus, customStatusId?: string) => {
            if (status === 'custom' && customStatusId === undefined) {
                throw new Error(
                    'customStatusId is required when status is "custom"',
                )
            }

            const data: UpdateUserAvailabilityAsUser =
                status === 'custom'
                    ? {
                          user_status: 'custom',
                          custom_user_availability_status_id:
                              customStatusId as string,
                      }
                    : { user_status: status }

            return mutateAsync({ userId, data })
        },
        [mutateAsync, userId],
    )

    return { update, ...rest }
}

type UpdateAvailability = {
    (status: 'available' | 'unavailable'): Promise<unknown>
    (status: 'custom', customStatusId: string): Promise<unknown>
}

type UseUpdateUserAvailabilityReturn = Omit<
    ReturnType<typeof useUpdateUserAvailabilityPrimitive>,
    'mutateAsync'
> & {
    update: UpdateAvailability
}
