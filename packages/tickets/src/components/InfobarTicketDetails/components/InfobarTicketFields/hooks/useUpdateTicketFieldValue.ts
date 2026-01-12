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
                const previewTicketFieldsValuesResult =
                    queryClient.getQueryData<ListTicketCustomFieldsResult>(
                        queryKey,
                    )
                if (!previewTicketFieldsValuesResult || !fieldDefinition) {
                    return
                }
                if (previewTicketFieldsValuesResult?.data.data.length === 0) {
                    const updatedTicketFieldsValuesResult = updateResult(
                        previewTicketFieldsValuesResult,
                        [
                            {
                                field: fieldDefinition,
                                value: value,
                            },
                        ],
                    )
                    queryClient.setQueryData<ListTicketCustomFieldsResult>(
                        queryKey,
                        updatedTicketFieldsValuesResult,
                    )
                    return {
                        previewTicketFieldsValuesResult,
                        updatedTicketFieldsValuesResult,
                    }
                }
                const updatedTicketFieldsValuesResult = updateResult(
                    previewTicketFieldsValuesResult,
                    previewTicketFieldsValuesResult.data.data.reduce<
                        TicketCustomFieldValue[]
                    >((acc, field) => {
                        if (field.id === fieldId) {
                            return [
                                ...acc,
                                {
                                    ...field,
                                    value: value,
                                },
                            ]
                        }
                        return [...acc, field]
                    }, []),
                )
                queryClient.setQueryData<ListTicketCustomFieldsResult>(
                    queryKey,
                    updatedTicketFieldsValuesResult,
                )
                return {
                    previewTicketFieldsValuesResult,
                    updatedTicketFieldsValuesResult,
                }
            },
            onError: (_, __, context) => {
                const { previewTicketFieldsValuesResult } = context ?? {}
                if (previewTicketFieldsValuesResult) {
                    queryClient.setQueryData<ListTicketCustomFieldsResult>(
                        queryKey,
                        previewTicketFieldsValuesResult,
                    )
                }
            },
            onSettled: async () => {
                await queryClient.invalidateQueries({ queryKey })
            },
        },
    })
}
