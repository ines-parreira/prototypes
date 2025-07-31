import { useQueryClient } from '@tanstack/react-query'

import {
    queryKeys,
    UpdateCustomerCustomFieldValueBody,
    useDeleteCustomerCustomFieldValue,
    useUpdateCustomerCustomFieldValue,
} from '@gorgias/helpdesk-queries'

import { createOnErrorHandler } from 'custom-fields/helpers/createOnErrorHandler'
import { isCustomFieldValueEmpty } from 'custom-fields/helpers/isCustomFieldValueEmpty'
import useAppDispatch from 'hooks/useAppDispatch'

export const useUpdateOrDeleteCustomerFieldValue = ({
    isDisabled = false,
} = {}) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const internalErrorHandler = createOnErrorHandler(
        dispatch,
        'Failed to update customer field value. Please try again in a few seconds.',
    )
    const mutationOptions = {
        onSuccess: (__data: unknown, params: { customerId: number }) => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.customers.listCustomerCustomFieldsValues(
                    params.customerId,
                ),
            })
        },
        onError: (error: unknown) => {
            internalErrorHandler(error)
        },
    }

    const { mutate: updateMutate } = useUpdateCustomerCustomFieldValue({
        mutation: mutationOptions,
    })

    const { mutate: deleteMutate } = useDeleteCustomerCustomFieldValue({
        mutation: mutationOptions,
    })

    return {
        mutate: function mutate(params: {
            customerId: number
            fieldId: number
            value?: UpdateCustomerCustomFieldValueBody
        }) {
            if (isDisabled) return
            if (!('value' in params) || isCustomFieldValueEmpty(params.value)) {
                return deleteMutate({
                    customerId: params.customerId,
                    id: params.fieldId,
                })
            }
            return updateMutate({
                customerId: params.customerId,
                id: params.fieldId,
                // We need to add quotes for strings that could be considered
                // as numbers by axios and JSON.stringify does it.
                data: JSON.stringify(params.value),
            })
        },
    }
}
