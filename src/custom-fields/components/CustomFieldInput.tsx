import React from 'react'

import MultiLevelSelect from 'custom-fields/components/MultiLevelSelect'
import {getNumberOrUndefined} from 'custom-fields/helpers/getNumberOrUndefined'
import {
    isDropdownInput,
    isNumberInput,
    isTextInput,
} from 'custom-fields/helpers/typeGuards'
import {
    CustomField,
    CustomFieldPrediction,
    CustomFieldValue,
} from 'custom-fields/types'

import StealthInput from './StealthInput'

type Props = {
    id: string
    field: CustomField
    value?: CustomFieldValue
    hasError?: boolean
    isDisabled?: boolean
    onChange: (nextValue: CustomFieldValue | undefined) => void
    onFocus?: () => void
    onBlur?: () => void
    placeholder?: string
    prediction?: CustomFieldPrediction
}

export default function CustomFieldInput({
    field,
    value,
    hasError = false,
    isDisabled = false,
    onChange,
    onFocus,
    onBlur,
    id,
    placeholder,
    prediction,
}: Props) {
    if (isTextInput(field)) {
        return (
            <StealthInput
                id={id}
                name={field.label}
                type="text"
                value={value?.toString() || ''}
                onChange={onChange}
                hasError={hasError}
                isDisabled={isDisabled}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder={
                    field.definition.input_settings.placeholder || placeholder
                }
            />
        )
    }

    if (isNumberInput(field)) {
        return (
            <StealthInput
                id={id}
                name={field.label}
                type="number"
                min={field.definition.input_settings.min}
                max={field.definition.input_settings.max}
                value={getNumberOrUndefined(value)}
                onChange={(nextValue) =>
                    onChange(getNumberOrUndefined(nextValue))
                }
                hasError={hasError}
                isDisabled={isDisabled}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder={placeholder}
            />
        )
    }

    if (isDropdownInput(field)) {
        return (
            <MultiLevelSelect
                id={field.id}
                label={field.label}
                inputId={id}
                prediction={prediction}
                value={value}
                onChange={onChange}
                hasError={hasError}
                onFocus={onFocus}
                placeholder={placeholder}
                choices={field.definition.input_settings.choices}
                isDisabled={isDisabled}
            />
        )
    }

    return <div>Coming soon</div>
}
