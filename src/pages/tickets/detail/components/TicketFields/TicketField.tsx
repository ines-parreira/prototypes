import React, {memo, useCallback} from 'react'

import {CustomField, CustomFieldState} from 'models/customField/types'
import {OnMutateSettings} from 'models/customField/queries'
import TextField from './Components/fields/TextField'
import DropdownField from './Components/fields/DropdownField'

type Props = {
    fieldDefinition: CustomField
    fieldState?: CustomFieldState
    onChange: (
        id: CustomFieldState['id'],
        value: CustomFieldState['value'],
        settings?: OnMutateSettings
    ) => void
}

function TicketField({fieldDefinition, fieldState, onChange}: Props) {
    const {id, label, required, definition} = fieldDefinition

    const handleChange = useCallback(
        (value: CustomFieldState['value'], settings) =>
            onChange(id, value, settings),
        [id, onChange]
    )

    if (definition.input_settings.input_type === 'input') {
        const textFieldProps = {
            id,
            label,
            fieldState,
            isRequired: required,
            placeholder: definition.input_settings.placeholder,
            onChange: handleChange,
        }
        return <TextField {...textFieldProps} />
    } else if (definition.input_settings.input_type === 'dropdown') {
        const dropdownProps = {
            id,
            label,
            fieldState,
            choices: definition.input_settings.choices,
            isRequired: required,
            onChange: handleChange,
        }
        return <DropdownField {...dropdownProps} />
    }

    return <div>Coming soon</div>
}

export default memo(TicketField)
