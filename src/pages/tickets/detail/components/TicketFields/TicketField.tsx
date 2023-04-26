import React, {memo} from 'react'

import {CustomField, CustomFieldState} from 'models/customField/types'
import TextField from './components/fields/TextField'
import DropdownField from './components/fields/DropdownField'

type Props = {
    fieldDefinition: CustomField
    fieldState?: CustomFieldState
}

function TicketField({fieldDefinition, fieldState}: Props) {
    const {id, label, required, definition} = fieldDefinition

    if (definition.input_settings.input_type === 'input') {
        const textFieldProps = {
            id,
            label,
            fieldState,
            isRequired: required,
            placeholder: definition.input_settings.placeholder,
        }
        return <TextField {...textFieldProps} />
    } else if (definition.input_settings.input_type === 'dropdown') {
        const dropdownProps = {
            id,
            label,
            fieldState,
            choices: definition.input_settings.choices,
            isRequired: required,
        }
        return <DropdownField {...dropdownProps} />
    }

    return <div>Coming soon</div>
}

export default memo(TicketField)
