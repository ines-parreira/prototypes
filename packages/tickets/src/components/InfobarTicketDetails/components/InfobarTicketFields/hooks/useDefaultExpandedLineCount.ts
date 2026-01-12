import { useMemo } from 'react'

import { isCustomFieldValueEmpty } from '../../../../InfobarCustomerFields/utils/isCustomFieldValueEmpty'
import type { TicketFieldsState } from '../store/useTicketFieldsStore'
import { useTicketFields } from './useTicketFields'

const DEFAULT_MIN_LINE_COUNT = 3

export function useDefaultExpandedLineCount(fields: TicketFieldsState): number {
    const { ticketFields, isLoading } = useTicketFields()

    return useMemo(() => {
        if (isLoading || ticketFields.length === 0) {
            return DEFAULT_MIN_LINE_COUNT
        }

        const lastRequiredOrFilledIndex = ticketFields.reduce(
            (acc, ticketField, index) => {
                const fieldState = fields[ticketField.fieldDefinition.id]
                const isRequired = ticketField.isRequired
                const isFilled = !isCustomFieldValueEmpty(fieldState?.value)

                if (isRequired || isFilled) {
                    return index
                }
                return acc
            },
            -1,
        )

        return Math.max(lastRequiredOrFilledIndex + 1, DEFAULT_MIN_LINE_COUNT)
    }, [ticketFields, fields, isLoading])
}
