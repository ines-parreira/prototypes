import { useQueryClient } from '@tanstack/react-query'

import type { ListTicketCustomFieldsResult } from '@gorgias/helpdesk-queries'
import {
    queryKeys,
    useDeleteTicketCustomField as useDeleteTicketFieldValuePrimitive,
} from '@gorgias/helpdesk-queries'

import { updateResult } from '../../../../../utils/optimisticUpdates/updateResult'

export function useDeleteTicketFieldValue(ticketId: number) {
    const queryClient = useQueryClient()
    const queryKey = queryKeys.tickets.listTicketCustomFields(ticketId)

    return useDeleteTicketFieldValuePrimitive({
        mutation: {
            onMutate: async ({ id: fieldId }) => {
                await queryClient.cancelQueries({ queryKey })
                const previewTicketFieldsValuesResult =
                    queryClient.getQueryData<ListTicketCustomFieldsResult>(
                        queryKey,
                    )
                if (!previewTicketFieldsValuesResult) {
                    return
                }
                const updatedTicketFieldsValuesResult = updateResult(
                    previewTicketFieldsValuesResult,
                    previewTicketFieldsValuesResult.data.data.filter(
                        (field) => field.id !== fieldId,
                    ),
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
