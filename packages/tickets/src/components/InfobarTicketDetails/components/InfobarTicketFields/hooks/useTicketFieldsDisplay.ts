import { useEffect, useState } from 'react'

import { useTicketFieldsStore } from '../store/useTicketFieldsStore'
import { useTicketFields } from './useTicketFields'

export const DEFAULT_VISIBLE_FIELD_COUNT = 5

export function useTicketFieldsDisplay() {
    const [isExpanded, setIsExpanded] = useState(false)
    const { ticketFields } = useTicketFields()
    const fieldsState = useTicketFieldsStore((state) => state.fields)
    const validationFailureCount = useTicketFieldsStore(
        (state) => state.validationFailureCount,
    )

    useEffect(() => {
        if (validationFailureCount > 0) {
            const hasHiddenFieldErrors = ticketFields.some((field, index) => {
                if (index < DEFAULT_VISIBLE_FIELD_COUNT) {
                    return false
                }
                const fieldState = fieldsState[field.fieldDefinition.id]
                return fieldState?.hasError === true
            })

            if (hasHiddenFieldErrors) {
                setIsExpanded(true)
            }
        }
    }, [validationFailureCount, ticketFields, fieldsState])

    return { isExpanded, setIsExpanded }
}
