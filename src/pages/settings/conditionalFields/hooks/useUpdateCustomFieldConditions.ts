import { useQueryClient } from '@tanstack/react-query'

import {
    CustomFieldCondition,
    ListCustomFieldConditionsResult,
    queryKeys,
    useUpdateCustomFieldConditions as useBulkUpdate,
} from '@gorgias/helpdesk-queries'

/**
 * Wrapper for the SDK's useUpdateCustomFieldConditions method with:
 * - Optimistic update
 * - Query invalidation
 */
export default function useUpdateCustomFieldConditions() {
    const queryClient = useQueryClient()
    const queryKey = queryKeys.customFieldConditions.listCustomFieldConditions()

    return useBulkUpdate({
        mutation: {
            onMutate: async ({ data }) => {
                // Cancel outgoing queries (to not overwrite the optimistic update)
                await queryClient.cancelQueries({ queryKey })

                // Convert the new data from a list to a mapping by ID
                const newPartialData: Record<number, CustomFieldCondition> =
                    data.reduce((acc, row) => ({ ...acc, [row.id]: row }), {})

                // Optimistically update each values with the partial new data
                queryClient.setQueryData<ListCustomFieldConditionsResult>(
                    queryKey,
                    (oldData) => {
                        if (!oldData) return

                        const newData = oldData.data.data
                            .map((oldCondition) => ({
                                ...oldCondition,
                                ...(newPartialData[oldCondition.id] || {}),
                            }))
                            .sort((a, b) => a.sort_order - b.sort_order)

                        return {
                            ...oldData,
                            data: {
                                ...oldData?.data,
                                data: newData,
                            },
                        }
                    },
                )
            },
            onSettled: () => {
                void queryClient.invalidateQueries({ queryKey })
            },
        },
    })
}
