import React, {ComponentProps} from 'react'
import classNames from 'classnames'

import {CustomField, CustomFieldValue} from 'models/customField/types'
import InputField from 'pages/common/forms/input/InputField'
import NumberInput from 'pages/common/forms/input/NumberInput'
import MultiLevelSelect from 'pages/tickets/detail/components/TicketFields/components/fields/DropdownField/MultiLevelSelect'

type Props = {
    customField: CustomField
    value?: CustomFieldValue
    onChange: (value: Maybe<CustomFieldValue>) => void
    className?: any
    isRequired?: boolean
}

/**
 * Component that shows the relevant value input for a given custom field.
 * For text or numbers, a basic input, and for dropdowns, a select input.
 */
function CustomFieldInput({
    customField,
    value,
    className,
    isRequired,
    ...props
}: Props) {
    const definition = customField.definition
    const baseFieldProps = {
        isRequired:
            isRequired !== undefined ? isRequired : customField.required,
        ...props,
    }

    // Text input
    if (
        definition.input_settings.input_type === 'input' &&
        definition.data_type === 'text'
    ) {
        const textFieldProps = {
            ...baseFieldProps,
            className: classNames(className, 'custom-field-input--text'),
            placeholder:
                definition.input_settings.placeholder || 'Set value...',
            value: typeof value === 'string' ? value : undefined,
        }
        return <InputField {...textFieldProps} />
    }

    // Number input
    if (
        definition.input_settings.input_type === 'input_number' &&
        definition.data_type === 'number'
    ) {
        const handleChange = (value?: CustomFieldValue) => {
            props.onChange(value === undefined ? null : value)
        }
        const numberFieldProps: ComponentProps<typeof NumberInput> = {
            ...baseFieldProps,
            onChange: handleChange,
            className: classNames(className, 'custom-field-input--number'),
            placeholder: 'Set value...',
            value:
                typeof value === 'number'
                    ? value
                    : typeof value === 'string'
                    ? parseInt(value, 10)
                    : undefined,
        }
        if (definition.input_settings.min !== undefined) {
            numberFieldProps.min = Number(definition.input_settings.min)
        }
        if (definition.input_settings.max !== undefined) {
            numberFieldProps.max = Number(definition.input_settings.max)
        }
        return <NumberInput {...numberFieldProps} />
    }

    // Dropdown
    if (
        definition.input_settings.input_type === 'dropdown' &&
        ['text', 'boolean'].includes(definition.data_type)
    ) {
        const choices = definition.input_settings.choices
        const dropdownProps = {
            ...baseFieldProps,
            value:
                value !== undefined && choices.includes(value)
                    ? value
                    : undefined,
            placeholder: 'Select an option',
            choices,
            id: customField.id,
            label: customField.label,
            showFullValue: true,
            autoWidth: true,
            inputId: `rule-custom-field-${customField.id}`,
        }
        return (
            <div
                className={classNames(
                    className,
                    'custom-field-input--dropdown'
                )}
            >
                <MultiLevelSelect {...dropdownProps} />
            </div>
        )
    }

    return <div>Coming soon</div>
}

export default CustomFieldInput
