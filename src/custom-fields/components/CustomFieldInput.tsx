import React from 'react'

import MultiLevelSelect from 'custom-fields/components/MultiLevelSelect'
import { getNumberOrUndefined } from 'custom-fields/helpers/getNumberOrUndefined'
import {
    isDropdownInput,
    isNumberInput,
    isTextInput,
} from 'custom-fields/helpers/typeGuards'
import { CustomField, CustomFieldValue } from 'custom-fields/types'

import { MultiLevelSelectProps } from './MultiLevelSelect/MultiLevelSelect'
import StealthInput from './StealthInput'

export type CustomFieldInputProps = {
    id: string
    field: CustomField
    value?: CustomFieldValue | CustomFieldValue[]
    hasError?: boolean
    isDisabled?: boolean
    onChange: (
        nextValue: CustomFieldValue | CustomFieldValue[] | undefined,
    ) => void
    onFocus?: () => void
    onBlur?: () => void
    placeholder?: string
    dropdownAdditionalProps?: Pick<
        MultiLevelSelectProps<boolean | undefined>,
        'prediction' | 'allowMultiValues' | 'customDisplayValue' | 'placement'
    >
    className?: string
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
    dropdownAdditionalProps,
    className,
}: CustomFieldInputProps) {
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
                className={className}
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
                value={getNumberOrUndefined(value as CustomFieldValue)}
                onChange={(nextValue) =>
                    onChange(getNumberOrUndefined(nextValue))
                }
                hasError={hasError}
                isDisabled={isDisabled}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder={placeholder}
                className={className}
            />
        )
    }

    if (isDropdownInput(field)) {
        return (
            <div className={className}>
                <MultiLevelSelect
                    id={field.id}
                    label={field.label}
                    inputId={id}
                    hasError={hasError}
                    onFocus={onFocus}
                    placeholder={placeholder}
                    choices={field.definition.input_settings.choices || []}
                    isDisabled={isDisabled}
                    onChange={onChange}
                    value={value}
                    {...dropdownAdditionalProps}
                />
            </div>
        )
    }

    return <div>Coming soon</div>
}
