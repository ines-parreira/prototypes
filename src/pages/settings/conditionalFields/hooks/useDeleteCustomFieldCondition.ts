import { useQueryClient } from '@tanstack/react-query'
import { produce } from 'immer'

import {
    ListCustomFieldConditionsQueryResult,
    queryKeys,
    useDeleteCustomFieldCondition as useDelete,
} from '@gorgias/api-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

/**
 * Wrapper for the SDK's useUpdateCustomFieldCondition method with:
 * - Optimistic update
 * - Query invalidation
 * - Notifications
 */
export default function useDeleteCustomFieldCondition() {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return useDelete({
        mutation: {
            onSuccess: (_response, { id }) => {
                const queryKey =
                    queryKeys.customFieldConditions.listCustomFieldConditions()
                queryClient.setQueryData<ListCustomFieldConditionsQueryResult>(
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

                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Successfully deleted condition',
                    }),
                )
            },
            onError: () => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: 'Failed to delete condition',
                    }),
                )
            },
        },
    })
}
