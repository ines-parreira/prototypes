import { useQueryClient } from '@tanstack/react-query'
import { produce } from 'immer'

import {
    ListCustomFieldConditionsResult,
    queryKeys,
    useUpdateCustomFieldCondition as useUpdate,
} from '@gorgias/helpdesk-queries'

/**
 * Wrapper for the SDK's useUpdateCustomFieldCondition method with:
 * - Optimistic update
 * - Query invalidation
 */
export default function useUpdateCustomFieldCondition() {
    const queryClient = useQueryClient()

    return useUpdate({
        mutation: {
            onSuccess: (_response, { id, data }) => {
                const queryKey =
                    queryKeys.customFieldConditions.listCustomFieldConditions()
                queryClient.setQueryData<ListCustomFieldConditionsResult>(
                    queryKey,
                    (oldData) => {
                        if (!oldData) return
                        return produce(oldData, (draft) => {
                            const row = draft.data.data.find((c) => c.id === id)
                            if (row) {
                                Object.assign(row, data)
                            }
                        })
                    },
                )
                void queryClient.invalidateQueries({ queryKey })
            },
        },
    })
}
