import { useQueryClient } from '@tanstack/react-query'

import {
    queryKeys,
    useCreateCustomFieldCondition as useCreate,
} from '@gorgias/api-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { isGorgiasApiError } from 'models/api/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { errorToChildren } from 'utils'

/**
 * Wrapper for the SDK's useCreateCustomFieldCondition method that:
 * - Query invalidation
 * - Notifications
 */
export default function useCreateCustomFieldCondition() {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return useCreate({
        mutation: {
            onSuccess: () => {
                const queryKey =
                    queryKeys.customFieldConditions.listCustomFieldConditions()
                void queryClient.invalidateQueries({ queryKey })

                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Condition created successfully',
                    }),
                )
            },
            onError: (error) => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        title: isGorgiasApiError(error)
                            ? error.response?.data.error.msg
                            : 'Failed to create condition',
                        message: errorToChildren(error) || undefined,
                        allowHTML: true,
                    }),
                )
            },
        },
    })
}
