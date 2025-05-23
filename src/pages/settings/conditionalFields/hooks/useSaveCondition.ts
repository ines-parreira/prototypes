import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    CreateCustomFieldCondition,
    queryKeys,
    UpdateCustomFieldCondition,
    useCreateCustomFieldCondition,
} from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { isGorgiasApiError } from 'models/api/types'
import history from 'pages/history'
import { CUSTOM_FIELD_CONDITIONS_ROUTE } from 'routes/constants'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { errorToChildren } from 'utils'

import useUpdateCustomFieldCondition from './useUpdateCustomFieldCondition'

export default function useSaveCondition(conditionId?: number) {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    const { mutateAsync: createCondition, isLoading: isCreating } =
        useCreateCustomFieldCondition()
    const { mutateAsync: updateCondition, isLoading: isUpdating } =
        useUpdateCustomFieldCondition()

    const onSubmit = useCallback(
        async (
            data: CreateCustomFieldCondition | UpdateCustomFieldCondition,
        ) => {
            try {
                !conditionId
                    ? await createCondition({
                          data: data as CreateCustomFieldCondition,
                      })
                    : await updateCondition({
                          id: conditionId,
                          data: data as UpdateCustomFieldCondition,
                      })

                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: `Condition ${
                            conditionId ? 'updated' : 'created'
                        } successfully`,
                    }),
                )
                void queryClient.invalidateQueries({
                    queryKey:
                        queryKeys.customFieldConditions.listCustomFieldConditions(),
                })
                if (conditionId) {
                    void queryClient.invalidateQueries({
                        queryKey:
                            queryKeys.customFieldConditions.getCustomFieldCondition(
                                conditionId,
                            ),
                    })
                }
                history.push(`/app/settings/${CUSTOM_FIELD_CONDITIONS_ROUTE}`)
            } catch (error) {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        title: isGorgiasApiError(error)
                            ? error.response?.data.error.msg
                            : `Failed to ${
                                  conditionId ? 'update' : 'create'
                              } condition.`,
                        message: errorToChildren(error) || undefined,
                        allowHTML: true,
                    }),
                )
            }
        },
        [createCondition, updateCondition, dispatch, conditionId, queryClient],
    )

    return { onSubmit, isSubmitting: isCreating || isUpdating }
}
