import { useCallback } from 'react'

import type { UpdateTicketCustomFieldBody } from '@gorgias/helpdesk-queries'

import { useTicketsLegacyBridge } from '../../../../../utils/LegacyBridge'
import { NotificationStatus } from '../../../../../utils/LegacyBridge/context'
import { isCustomFieldValueEmpty } from '../../../../InfobarCustomerFields/utils'
import { useDeleteTicketFieldValue } from './useDeleteTicketFieldValue'
import { useTicketCustomFieldsValues } from './useTicketCustomFieldsValues'
import { useUpdateTicketFieldValue } from './useUpdateTicketFieldValue'

export function useUpdateOrDeleteTicketFieldValue(ticketId: number) {
    const { dispatchNotification } = useTicketsLegacyBridge()
    const { data: { data: ticketCustomFieldsValue = [] } = {} } =
        useTicketCustomFieldsValues(Number(ticketId))

    const { mutateAsync: mutateAsyncUpdate } =
        useUpdateTicketFieldValue(ticketId)

    const { mutateAsync: mutateAsyncDelete } =
        useDeleteTicketFieldValue(ticketId)

    const updateOrDeleteCustomerFieldValue = useCallback(
        async (params: {
            fieldId: number
            value?: UpdateTicketCustomFieldBody
        }) => {
            try {
                if (
                    !('value' in params) ||
                    isCustomFieldValueEmpty(params.value)
                ) {
                    /**
                     * Case where the user has only never set a value for the field
                     * for example, focusing & then leaving the field without setting a value.
                     * This avoid us trying to delete non-existent field value
                     */
                    const field = ticketCustomFieldsValue.find(
                        (field) => field.field?.id === params.fieldId,
                    )

                    if (!field) {
                        return
                    }

                    await mutateAsyncDelete({
                        ticketId,
                        id: params.fieldId,
                    })
                } else {
                    await mutateAsyncUpdate({
                        ticketId,
                        id: params.fieldId,
                        // We need to add quotes for strings that could be considered
                        // as numbers by axios and JSON.stringify does it.
                        data: JSON.stringify(params.value),
                    })
                }
            } catch {
                dispatchNotification({
                    status: NotificationStatus.Error,
                    message: 'Failed to update ticket field',
                })
            }
        },
        [
            mutateAsyncUpdate,
            mutateAsyncDelete,
            dispatchNotification,
            ticketId,
            ticketCustomFieldsValue,
        ],
    )

    return {
        updateOrDeleteCustomerFieldValue,
    }
}
