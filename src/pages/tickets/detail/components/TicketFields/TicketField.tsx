import React, { memo } from 'react'

import {
    CustomField,
    CustomFieldState,
    isCustomFieldSystemReadOnly,
} from 'custom-fields/types'
import NumberField, {
    Props as NumberFieldProps,
} from 'pages/tickets/detail/components/TicketFields/components/fields/NumberField'

import DropdownField from './components/fields/DropdownField'
import TextField from './components/fields/TextField'

type Props = {
    fieldDefinition: CustomField
    fieldState?: CustomFieldState
    isRequired: boolean
}

function TicketField({ fieldDefinition, fieldState, isRequired }: Props) {
    const { id, label, definition, managed_type } = fieldDefinition

    const baseFieldProps = {
        id,
        label,
        fieldState,
        isRequired,
        isDisabled: isCustomFieldSystemReadOnly(managed_type),
    }

    if (
        definition.input_settings.input_type === 'input' &&
        definition.data_type === 'text'
    ) {
        const textFieldProps = {
            ...baseFieldProps,
            placeholder: definition.input_settings.placeholder,
        }
        return <TextField {...textFieldProps} />
    } else if (
        definition.input_settings.input_type === 'input_number' &&
        definition.data_type === 'number'
    ) {
        const numberFieldProps: NumberFieldProps = {
            ...baseFieldProps,
        }
        if (definition.input_settings.min !== undefined) {
            numberFieldProps.min = Number(definition.input_settings.min)
        }
        if (definition.input_settings.max !== undefined) {
            numberFieldProps.max = Number(definition.input_settings.max)
        }
        return <NumberField {...numberFieldProps} />
    } else if (
        definition.input_settings.input_type === 'dropdown' &&
        ['text', 'boolean'].includes(definition.data_type)
    ) {
        const dropdownProps = {
            ...baseFieldProps,
            choices: definition.input_settings.choices,
        }
        return <DropdownField {...dropdownProps} />
    }

    return <div>Coming soon</div>
}

export default memo(TicketField)
