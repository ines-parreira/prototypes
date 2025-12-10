// Inspired by: apps/helpdesk/src/custom-fields/hooks/queries/useUpdateOrDeleteCustomerFieldValue.ts
import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { UpdateCustomerCustomFieldValueBody } from '@gorgias/helpdesk-queries'
import {
    queryKeys,
    useDeleteCustomerCustomFieldValue,
    useUpdateCustomerCustomFieldValue,
} from '@gorgias/helpdesk-queries'

import { useTicketsLegacyBridge } from '../../../utils/LegacyBridge'
import { NotificationStatus } from '../../../utils/LegacyBridge/context'
import { isCustomFieldValueEmpty } from '../utils'

export function useUpdateOrDeleteCustomCustomerFieldValue(customerId: number) {
    const { dispatchNotification } = useTicketsLegacyBridge()
    const queryClient = useQueryClient()
    const queryKey =
        queryKeys.customers.listCustomerCustomFieldsValues(customerId)

    const { mutateAsync: mutateAsyncUpdate } =
        useUpdateCustomerCustomFieldValue({
            mutation: {
                onMutate: async () => {
                    await queryClient.cancelQueries({ queryKey })
                },
            },
        })

    const { mutateAsync: mutateAsyncDelete, isLoading } =
        useDeleteCustomerCustomFieldValue({
            mutation: {
                onMutate: async () => {
                    await queryClient.cancelQueries({ queryKey })
                },
            },
        })

    const updateOrDeleteCustomerFieldValue = useCallback(
        async (params: {
            fieldId: number
            value?: UpdateCustomerCustomFieldValueBody
        }) => {
            try {
                if (
                    !('value' in params) ||
                    isCustomFieldValueEmpty(params.value)
                ) {
                    await mutateAsyncDelete({
                        customerId,
                        id: params.fieldId,
                    })
                } else {
                    await mutateAsyncUpdate({
                        customerId,
                        id: params.fieldId,
                        // We need to add quotes for strings that could be considered
                        // as numbers by axios and JSON.stringify does it.
                        data: JSON.stringify(params.value),
                    })
                }
                await queryClient.invalidateQueries({ queryKey })
            } catch {
                dispatchNotification({
                    status: NotificationStatus.Error,
                    message: 'Failed to update customer field',
                })
            }
        },
        [
            mutateAsyncUpdate,
            mutateAsyncDelete,
            queryClient,
            queryKey,
            dispatchNotification,
            customerId,
        ],
    )

    return {
        updateOrDeleteCustomerFieldValue,
        isLoading,
    }
}
