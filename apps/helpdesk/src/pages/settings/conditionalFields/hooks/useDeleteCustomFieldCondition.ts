import { useQueryClient } from '@tanstack/react-query'
import { produce } from 'immer'

import { toast } from '@gorgias/axiom'
import type { ListCustomFieldConditionsResult } from '@gorgias/helpdesk-queries'
import {
    queryKeys,
    useDeleteCustomFieldCondition as useDelete,
} from '@gorgias/helpdesk-queries'

/**
 * Wrapper for the SDK's useUpdateCustomFieldCondition method with:
 * - Optimistic update
 * - Query invalidation
 * - Notifications
 */
export function useDeleteCustomFieldCondition() {
    const queryClient = useQueryClient()

    return useDelete({
        mutation: {
            onSuccess: (_response, { id }) => {
                const queryKey =
                    queryKeys.customFieldConditions.listCustomFieldConditions()
                queryClient.setQueryData<ListCustomFieldConditionsResult>(
                    queryKey,
                    (oldData) => {
                        if (!oldData) return
                        return produce(oldData, (draft) => {
                            draft.data.data = draft.data.data.filter(
                                (c) => c.id !== id,
                            )
                        })
                    },
                )
                void queryClient.invalidateQueries({ queryKey })

                toast.success('Successfully deleted condition')
            },
            onError: () => {
                toast.error('Failed to delete condition')
            },
        },
    })
}
