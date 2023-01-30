import React, {memo, useCallback} from 'react'

import {CustomField, CustomFieldValue} from 'models/customField/types'
import {OnMutateSettings} from 'models/customField/queries'
import TextField from './Components/fields/TextField'
import DropdownField from './Components/fields/DropdownField'

type Props = {
    fieldData: CustomField
    value: CustomFieldValue['value']
    onChange: (
        id: CustomFieldValue['id'],
        value: CustomFieldValue['value'],
        settings?: OnMutateSettings
    ) => void
}

function TicketField({fieldData, value, onChange}: Props) {
    const {id, label, required, definition} = fieldData

    const handleChange = useCallback(
        (value: CustomFieldValue['value'], settings) =>
            onChange(id, value, settings),
        [id, onChange]
    )

    if (definition.input_settings.input_type === 'input') {
        const textFieldProps = {
            label,
            value,
            isRequired: required,
            placeholder: definition.input_settings.placeholder,
            onChange: handleChange,
        }
        return <TextField {...textFieldProps} />
    } else if (definition.input_settings.input_type === 'dropdown') {
        const dropdownProps = {
            label,
            value,
            choices: definition.input_settings.choices,
            isRequired: required,
            onChange: handleChange,
        }
        return <DropdownField {...dropdownProps} />
    }

    return <div>Coming soon</div>
}

export default memo(TicketField)
