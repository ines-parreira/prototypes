import { useEffect, useState } from 'react'

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
    const [previousQueryValue, setPreviousQueryValue] = useState<
        CustomFieldValue | undefined
    >(queryValue)
    const [currentValue, setCurrentValue] = useState<
        CustomFieldValue | undefined
    >(queryValue)

    const { updateOrDeleteCustomerFieldValue } =
        useUpdateOrDeleteCustomCustomerFieldValue(customerId)

    const mutate = (value: CustomFieldValue | undefined) => {
        return updateOrDeleteCustomerFieldValue({
            fieldId: field.id,
            value,
        })
    }

    const handleChange = (newValue: CustomFieldValue | undefined) => {
        if (isNumberInput(field)) {
            const numberValue = getNumberOrUndefined(newValue)
            setCurrentValue(numberValue)
            return mutate(numberValue)
        }

        if (isTextInput(field)) {
            const textValue = newValue?.toString().trim()
            setCurrentValue(textValue)
            return mutate(textValue)
        }

        // Dropdown field
        setCurrentValue(newValue)
        mutate(newValue)
    }

    // Update the local value when the query value changes
    useEffect(() => {
        if (queryValue !== previousQueryValue) {
            setPreviousQueryValue(queryValue)
            setCurrentValue(queryValue)
        }
    }, [queryValue, previousQueryValue])

    return (
        <FieldRow label={field.label}>
            <CustomCustomerFieldInput
                field={field}
                value={currentValue}
                onChange={handleChange}
            />
        </FieldRow>
    )
}
