import React, {useCallback} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {getCustomFieldValueById} from 'state/ticket/selectors'
import {CustomField, CustomFieldValue} from 'models/customField/types'
import TextField from './Components/fields/TextField'
import DropdownField from './Components/fields/DropdownField'

type Props = {
    fieldData: CustomField
    onChange: (
        leading: boolean,
        newValue: CustomFieldValue['value'],
        id: CustomFieldValue['id']
    ) => void
}

export default function TicketField({fieldData, onChange}: Props) {
    const {id, label, required, definition} = fieldData
    const value = useAppSelector((state) =>
        getCustomFieldValueById(state, id)
    )?.value

    const handleChange = useCallback(
        (
            newValue: CustomFieldValue['value'],
            leading: boolean | undefined = true
        ) => onChange(leading, newValue, id),
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
