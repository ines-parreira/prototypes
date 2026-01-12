import { useEffect } from 'react'

import { useTicketCustomFieldsValues } from '../hooks/useTicketCustomFieldsValues'
import { useTicketFieldsStore } from './useTicketFieldsStore'

export const useInitializeTicketFieldsStore = (ticketId: string) => {
    const initializeFields = useTicketFieldsStore(
        (state) => state.initializeFields,
    )

    const {
        data: { data: ticketCustomFieldsValue = [] } = {},
        isLoading,
        isError,
    } = useTicketCustomFieldsValues(Number(ticketId))

    useEffect(() => {
        if (!isLoading && !isError && ticketCustomFieldsValue.length > 0) {
            const fieldsState = ticketCustomFieldsValue.reduce(
                (acc, { field, value }) => {
                    if (!field) {
                        return acc
                    }
                    acc[field.id] = {
                        id: field.id,
                        value,
                        hasError: false,
                        prediction: undefined,
                    }
                    return acc
                },
                {} as Record<string, any>,
            )

            initializeFields(fieldsState)
        }
    }, [ticketCustomFieldsValue, isLoading, isError, initializeFields])

    return { isLoading, isError }
}
