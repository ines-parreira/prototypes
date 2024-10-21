import {Tooltip} from '@gorgias/ui-kit'
import React, {useState} from 'react'

import CustomFieldInput from 'custom-fields/components/CustomFieldInput'
import Label from 'custom-fields/components/Label'
import {getLabel} from 'custom-fields/components/MultiLevelSelect/helpers/getLabels'
import {OBJECT_TYPES} from 'custom-fields/constants'
import {getNumberOrUndefined} from 'custom-fields/helpers/getNumberOrUndefined'
import {
    isDropdownInput,
    isNumberInput,
    isTextInput,
} from 'custom-fields/helpers/typeGuards'
import {useUpdateOrDeleteCustomerFieldValue} from 'custom-fields/hooks/queries/useUpdateOrDeleteCustomerFieldValue'
import {CustomField, CustomFieldValue} from 'custom-fields/types'
import css from './CustomerField.less'

export default function CustomerField({
    field,
    value: queryValue,
    customerId,
}: {
    field: CustomField
    value: CustomFieldValue | undefined
    customerId: number
}) {
    const [previousQueryValue, setPreviousQueryValue] = useState<
        CustomFieldValue | undefined
    >(queryValue)

    const [currentValue, setCurrentValue] = useState<
        CustomFieldValue | undefined
    >(queryValue)

    const [isActive, setActive] = useState(false)

    const {mutate: rootMutate} = useUpdateOrDeleteCustomerFieldValue(
        {},
        {isDisabled: !customerId}
    )

    const mutate = (value: CustomFieldValue | undefined) => {
        return rootMutate([
            {
                fieldType: OBJECT_TYPES.CUSTOMER,
                holderId: customerId,
                fieldId: field.id,
                value,
            },
        ])
    }

    const handleChange = (newValue: CustomFieldValue | undefined) => {
        if (isDropdownInput(field)) {
            setCurrentValue(newValue)
            return mutate(newValue)
        }
        if (isNumberInput(field)) {
            return setCurrentValue(getNumberOrUndefined(newValue))
        }
        setCurrentValue(newValue)
    }

    const handleFocus = () => {
        setActive(true)
    }

    const handleBlur = () => {
        setActive(false)
        if (!isDropdownInput(field)) {
            let newValue = currentValue
            if (isTextInput(field)) {
                newValue = newValue?.toString().trim() || undefined
                setCurrentValue(newValue)
            }
            if (newValue !== queryValue) {
                mutate(newValue)
            }
        }
    }

    // Update the local value when the query value changes
    if (queryValue !== previousQueryValue) {
        setPreviousQueryValue(queryValue)
        setCurrentValue(queryValue)
    }

    const inputId = `customer-${customerId}-custom-field-value-input-${field.id}`

    return (
        <Label label={field.label} className={css.customerFieldWrapper}>
            {!!currentValue && !isActive && (
                <Tooltip placement="top" target={inputId} autohide={false}>
                    {getLabel(currentValue)}
                </Tooltip>
            )}
            <CustomFieldInput
                field={field}
                value={currentValue}
                id={inputId}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
            />
        </Label>
    )
}
