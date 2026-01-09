import type { CustomField } from '@gorgias/helpdesk-types'

import type { TreeValue } from '../../MultiLevelSelect'
import { MultiLevelSelect } from '../../MultiLevelSelect/MultiLevelSelect'
import type { CustomFieldValue } from '../types'
import {
    getNumberOrUndefined,
    isDropdownInput,
    isNumberInput,
    isTextInput,
    toNumberOrUndefined,
} from '../utils'
import { EditableField } from './EditableField/EditableField'

interface CustomCustomerFieldInputProps {
    field: CustomField
    value?: CustomFieldValue
    onChange: (nextValue: CustomFieldValue | undefined) => void
    className?: string
}

export function CustomCustomerFieldInput({
    field,
    value,
    onChange,
    className,
}: CustomCustomerFieldInputProps) {
    if (isTextInput(field)) {
        return (
            <EditableField
                type="text"
                value={value as string}
                onValueChange={onChange}
                placeholder={
                    field.definition.input_settings.placeholder || '+ Add'
                }
                className={className}
                ariaLabel={field.label}
            />
        )
    }

    if (isNumberInput(field)) {
        const { min, max } = field.definition.input_settings

        return (
            <EditableField
                type="number"
                value={getNumberOrUndefined(value)}
                onValueChange={(nextValue) => onChange(nextValue)}
                minValue={toNumberOrUndefined(min)}
                maxValue={toNumberOrUndefined(max)}
                placeholder={
                    field.definition.input_settings.placeholder || '+ Add'
                }
                className={className}
                ariaLabel={field.label}
            />
        )
    }

    if (isDropdownInput(field)) {
        const choices =
            'choices' in field.definition.input_settings
                ? field.definition.input_settings.choices || []
                : []

        return (
            <div className={className}>
                <MultiLevelSelect
                    choices={choices}
                    selectedValue={value as TreeValue}
                    onSelect={onChange}
                    placeholder="+ Add"
                    ariaLabel={field.label}
                />
            </div>
        )
    }

    return null
}
