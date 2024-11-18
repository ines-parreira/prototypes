import {Tooltip} from '@gorgias/merchant-ui-kit'
import React, {useState} from 'react'

import CustomFieldInput from 'custom-fields/components/CustomFieldInput'
import Label from 'custom-fields/components/Label'
import {getLabel} from 'custom-fields/components/MultiLevelSelect/helpers/getLabels'
import {isMultiValue} from 'custom-fields/components/MultiLevelSelect/helpers/isMultiValue'
import {OBJECT_TYPES} from 'custom-fields/constants'
import {getNumberOrUndefined} from 'custom-fields/helpers/getNumberOrUndefined'
import {
    isDropdownInput,
    isNumberInput,
    isTextInput,
} from 'custom-fields/helpers/typeGuards'
import {useUpdateOrDeleteCustomerFieldValue} from 'custom-fields/hooks/queries/useUpdateOrDeleteCustomerFieldValue'
import {CustomField, CustomFieldValue} from 'custom-fields/types'

import {MIN_CHARACTERS_TO_TOOLTIP} from './contstants'
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
    const isDropdownInputField = isDropdownInput(field)

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

    const handleChange = (
        newValue: CustomFieldValue | CustomFieldValue[] | undefined
    ) => {
        if (isMultiValue(newValue)) return
        if (isDropdownInputField) {
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
        if (!isDropdownInputField) {
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
    const shouldShowTooltip =
        (isDropdownInputField ? true : !isActive) &&
        typeof currentValue === 'string' &&
        currentValue.length >= MIN_CHARACTERS_TO_TOOLTIP

    return (
        <Label label={field.label} className={css.customerFieldWrapper}>
            {shouldShowTooltip && (
                <Tooltip
                    placement="left"
                    target={inputId}
                    autohide={false}
                    innerProps={{
                        boundariesElement: document.body,
                    }}
                >
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
                dropdownAdditionalProps={{placement: 'bottom-end'}}
            />
        </Label>
    )
}
