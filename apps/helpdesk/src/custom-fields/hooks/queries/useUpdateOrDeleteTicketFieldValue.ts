import { useEffect } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { UpdateTicketCustomFieldBody } from '@gorgias/helpdesk-queries'
import {
    queryKeys,
    useDeleteTicketCustomField,
    useUpdateTicketCustomField,
} from '@gorgias/helpdesk-queries'

import { createOnErrorHandler } from 'custom-fields/helpers/createOnErrorHandler'
import { isCustomFieldValueEmpty } from 'custom-fields/helpers/isCustomFieldValueEmpty'
import type { CustomFieldPrediction } from 'custom-fields/types'
import useAppDispatch from 'hooks/useAppDispatch'
import { updateCustomFieldPrediction } from 'state/ticket/actions'

type UpdateOrDeleteMutationOptions = NonNullable<
    Parameters<typeof useUpdateTicketCustomField>[0]
>['mutation'] &
    NonNullable<Parameters<typeof useDeleteTicketCustomField>[0]>['mutation']

export const useUpdateOrDeleteTicketFieldValue = (
    providedOverrides: UpdateOrDeleteMutationOptions = {},
    { isDisabled = false } = {},
) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const internalErrorHandler = createOnErrorHandler(
        dispatch,
        'Failed to update ticket field value. Please try again in a few seconds.',
    )

    const commonSuccessHandler = (ticketId: number) => {
        void queryClient.invalidateQueries({
            queryKey: queryKeys.tickets.listTicketCustomFields(ticketId),
        })
    }

    const commonOverrides: UpdateOrDeleteMutationOptions = {
        onSuccess: (__data, variables) => {
            commonSuccessHandler(variables.ticketId)
        },
        ...providedOverrides,
        onError: (error, variables, context) => {
            internalErrorHandler(error)
            providedOverrides.onError?.(error, variables, context)
        },
    }

    const { mutate: updateMutate, data: updateData } =
        useUpdateTicketCustomField({
            mutation: commonOverrides,
        })

    const { mutate: deleteMutate } = useDeleteTicketCustomField({
        mutation: commonOverrides,
    })

    useEffect(() => {
        if (updateData?.data.prediction) {
            const { field, prediction } = updateData.data
            if (field) {
                dispatch(
                    updateCustomFieldPrediction(
                        field.id,
                        prediction as CustomFieldPrediction,
                    ),
                )
            }
        }
    }, [updateData, dispatch])

    return {
        mutate: (params: {
            ticketId: number
            fieldId: number
            value?: UpdateTicketCustomFieldBody
        }) => {
            if (isDisabled) return
            if (!('value' in params) || isCustomFieldValueEmpty(params.value)) {
                return deleteMutate({
                    ticketId: params.ticketId,
                    id: params.fieldId,
                })
            }
            return updateMutate({
                ticketId: params.ticketId,
                id: params.fieldId,
                // We need to add quotes for strings that could be considered
                // as numbers by axios and JSON.stringify does it.
                data: JSON.stringify(params.value),
            })
        },
    }
}
