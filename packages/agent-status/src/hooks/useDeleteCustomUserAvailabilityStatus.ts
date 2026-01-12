import { useQueryClient } from '@tanstack/react-query'

import type {
    CustomUserAvailabilityStatus,
    HttpResponse,
} from '@gorgias/helpdesk-queries'
import {
    queryKeys,
    useDeleteCustomUserAvailabilityStatus as useDeleteCustomUserAvailabilityStatusPrimitive,
} from '@gorgias/helpdesk-queries'

type ListStatusesResponse = HttpResponse<{
    data: CustomUserAvailabilityStatus[]
}>

export function useDeleteCustomUserAvailabilityStatus() {
    const queryClient = useQueryClient()
    const listKey =
        queryKeys.customUserAvailabilityStatus.listCustomUserAvailabilityStatuses()

    return useDeleteCustomUserAvailabilityStatusPrimitive({
        mutation: {
            onMutate: async (params) => {
                await queryClient.cancelQueries({ queryKey: listKey })

                const previousStatuses = queryClient.getQueryData(listKey)

                queryClient.setQueryData<ListStatusesResponse | undefined>(
                    listKey,
                    (old) => {
                        if (!old?.data?.data) return old
                        return {
                            ...old,
                            data: {
                                ...old.data,
                                data: old.data.data.filter(
                                    (status) => status.id !== params.pk,
                                ),
                            },
                        }
                    },
                )

                return { previousStatuses }
            },
            onError: (error, params, context) => {
                if (context?.previousStatuses) {
                    queryClient.setQueryData(listKey, context.previousStatuses)
                }
            },
            onSettled: () => {
                queryClient.invalidateQueries({ queryKey: listKey })
            },
        },
    })
}
