import { useEffect } from 'react'

import { useTicketCustomFieldsValues } from '../hooks/useTicketCustomFieldsValues'
import type {
    CustomFieldValue,
    TicketFieldsState,
} from './useTicketFieldsStore'
import { useTicketFieldsStore } from './useTicketFieldsStore'

export const useInitializeTicketFieldsStore = (ticketId: string) => {
    const initializeFields = useTicketFieldsStore(
        (state) => state.initializeFields,
    )
    const resetFields = useTicketFieldsStore((state) => state.resetFields)

    const {
        data: { data: ticketCustomFieldsValue = [] } = {},
        isLoading,
        isError,
    } = useTicketCustomFieldsValues(Number(ticketId))

    useEffect(() => {
        resetFields()
    }, [ticketId, resetFields])

    useEffect(() => {
        if (isLoading || isError) {
            return
        }

        const fieldsState = ticketCustomFieldsValue.reduce<TicketFieldsState>(
            (acc, { field, value }) => {
                if (!field) {
                    return acc
                }

                acc[field.id] = {
                    id: field.id,
                    value: value as CustomFieldValue,
                    hasError: false,
                    prediction: undefined,
                }

                return acc
            },
            {},
        )

        initializeFields(fieldsState)
    }, [
        ticketId,
        ticketCustomFieldsValue,
        isLoading,
        isError,
        initializeFields,
    ])

    return { isLoading, isError }
}
