import { useCallback } from 'react'

import { history } from '@repo/routing'
import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import type {
    CreateCustomFieldCondition,
    UpdateCustomFieldCondition,
} from '@gorgias/helpdesk-queries'
import {
    queryKeys,
    useCreateCustomFieldCondition,
} from '@gorgias/helpdesk-queries'

import { isGorgiasApiError } from 'models/api/types'
import { CUSTOM_FIELD_CONDITIONS_ROUTE } from 'routes/constants'

import useUpdateCustomFieldCondition from './useUpdateCustomFieldCondition'

export default function useSaveCondition(conditionId?: number) {
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

                toast.success(
                    `Condition ${
                        conditionId ? 'updated' : 'created'
                    } successfully`,
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
                toast.error(
                    isGorgiasApiError(error)
                        ? error.response?.data.error.msg
                        : `Failed to ${
                              conditionId ? 'update' : 'create'
                          } condition.`,
                )
            }
        },
        [createCondition, updateCondition, conditionId, queryClient],
    )

    return { onSubmit, isSubmitting: isCreating || isUpdating }
}
