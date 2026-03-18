import { useCallback, useEffect, useRef, useState } from 'react'

import type { CustomField } from '@gorgias/helpdesk-types'

import { useUpdateOrDeleteCustomCustomerFieldValue } from '../hooks'
import type { CustomFieldValue } from '../types'
import { getNumberOrUndefined, isNumberInput, isTextInput } from '../utils'
import { CustomCustomerFieldInput } from './CustomCustomerFieldInput'
import { FieldRow } from './FieldRow'

interface CustomCustomerFieldProps {
    field: CustomField
    value: CustomFieldValue | undefined
    customerId: number
}

export function CustomCustomerField({
    field,
    value: queryValue,
    customerId,
}: CustomCustomerFieldProps) {
    const [currentValue, setCurrentValue] = useState<
        CustomFieldValue | undefined
    >(queryValue)
    const currentValueRef = useRef<CustomFieldValue | undefined>(queryValue)

    const { updateOrDeleteCustomerFieldValue } =
        useUpdateOrDeleteCustomCustomerFieldValue(customerId)

    // Temporary sync workaround until customer fields move to zustand state
    // like the ticket fields implementation used by InfobarTicketField.
    useEffect(() => {
        if (currentValueRef.current !== queryValue) {
            currentValueRef.current = queryValue
            setCurrentValue(queryValue)
        }
    }, [queryValue])

    const mutate = useCallback(
        (value: CustomFieldValue | undefined) => {
            return updateOrDeleteCustomerFieldValue({
                fieldId: field.id,
                value,
            })
        },
        [field.id, updateOrDeleteCustomerFieldValue],
    )

    const handleChange = useCallback(
        (newValue: CustomFieldValue | undefined) => {
            /**
             * We only save text input values on the text input blur event to avoid
             * unnecessary API calls when the user is typing.
             */
            if (isTextInput(field)) {
                const textValue = newValue?.toString()
                currentValueRef.current = textValue
                setCurrentValue(textValue)
                return
            }

            if (isNumberInput(field)) {
                const numberValue = getNumberOrUndefined(newValue)
                currentValueRef.current = numberValue
                setCurrentValue(numberValue)
                return mutate(numberValue)
            }

            // Dropdown field
            currentValueRef.current = newValue
            setCurrentValue(newValue)
            mutate(newValue)
        },
        [field, mutate],
    )

    const handleBlur = useCallback(
        (newValue: CustomFieldValue | undefined) => {
            if (isTextInput(field)) {
                const textValue = newValue?.toString()?.trim()
                currentValueRef.current = textValue
                setCurrentValue(textValue)
                return mutate(textValue)
            }
        },
        [field, mutate],
    )

    return (
        <FieldRow fieldId={`custom-field-${field.id}`} label={field.label}>
            <CustomCustomerFieldInput
                id={`custom-field-${field.id}`}
                field={field}
                value={currentValue}
                onChange={handleChange}
                onBlur={handleBlur}
            />
        </FieldRow>
    )
}
