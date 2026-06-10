import { useQueryClient } from '@tanstack/react-query'

import type {
    ListTicketCustomFieldsResult,
    TicketCustomField,
    TicketCustomFieldValue,
} from '@gorgias/helpdesk-queries'
import {
    ObjectType,
    queryKeys,
    useUpdateTicketCustomField as useUpdateTicketFieldValuePrimitive,
} from '@gorgias/helpdesk-queries'

import { updateResult } from '../../../../../utils/optimisticUpdates/updateResult'
import { useCustomFieldDefinitions } from './useCustomFieldDefinitions'

function getOptimisticValue(value: unknown) {
    if (typeof value !== 'string') {
        return value
    }

    try {
        return JSON.parse(value)
    } catch {
        return value
    }
}

function updateTicketCustomFieldValues({
    ticketFieldValues,
    fieldDefinition,
    fieldId,
    value,
}: {
    ticketFieldValues: TicketCustomFieldValue[]
    fieldDefinition: TicketCustomField
    fieldId: number
    value: unknown
}) {
    // Mutations send JSON.stringify(value) so axios preserves string fields that look numeric.
    // The optimistic cache must still store the semantic field value used by the UI.
    const optimisticValue = getOptimisticValue(value)
    const hasExistingFieldValue = ticketFieldValues.some(
        (ticketFieldValue) => ticketFieldValue.field?.id === fieldId,
    )

    if (!hasExistingFieldValue) {
        return [
            ...ticketFieldValues,
            {
                field: fieldDefinition,
                value: optimisticValue,
            },
        ]
    }

    return ticketFieldValues.map((ticketFieldValue) => {
        if (ticketFieldValue.field?.id !== fieldId) {
            return ticketFieldValue
        }

        return { ...ticketFieldValue, value: optimisticValue }
    })
}

export function useUpdateTicketFieldValue(ticketId: number) {
    const queryClient = useQueryClient()
    const queryKey = queryKeys.tickets.listTicketCustomFields(ticketId)

    const { data: { data: ticketFieldDefinitions = [] } = {} } =
        useCustomFieldDefinitions({
            archived: false,
            object_type: ObjectType.Ticket,
        })

    return useUpdateTicketFieldValuePrimitive({
        mutation: {
            onMutate: async ({ id: fieldId, data: value }) => {
                await queryClient.cancelQueries({ queryKey })
                const fieldDefinition = ticketFieldDefinitions.find(
                    (field) => field.id === fieldId,
                ) as TicketCustomField | undefined
                const previousTicketFieldsValuesResult =
                    queryClient.getQueryData<ListTicketCustomFieldsResult>(
                        queryKey,
                    )
                if (!previousTicketFieldsValuesResult || !fieldDefinition) {
                    return
                }
                const updatedTicketFieldsValuesResult = updateResult(
                    previousTicketFieldsValuesResult,
                    updateTicketCustomFieldValues({
                        ticketFieldValues:
                            previousTicketFieldsValuesResult.data.data,
                        fieldDefinition,
                        fieldId,
                        value,
                    }),
                )
                queryClient.setQueryData<ListTicketCustomFieldsResult>(
                    queryKey,
                    updatedTicketFieldsValuesResult,
                )
                return {
                    previousTicketFieldsValuesResult,
                    updatedTicketFieldsValuesResult,
                }
            },
            onError: (_, __, context) => {
                const { previousTicketFieldsValuesResult } = context ?? {}
                if (previousTicketFieldsValuesResult) {
                    queryClient.setQueryData<ListTicketCustomFieldsResult>(
                        queryKey,
                        previousTicketFieldsValuesResult,
                    )
                }
            },
            onSettled: async () => {
                await queryClient.invalidateQueries({ queryKey })
            },
        },
    })
}
