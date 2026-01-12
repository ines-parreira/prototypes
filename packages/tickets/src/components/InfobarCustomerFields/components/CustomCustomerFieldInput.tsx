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
    id?: string
    field: CustomField
    value?: CustomFieldValue
    onChange: (nextValue: CustomFieldValue | undefined) => void
    onBlur?: (nextValue: CustomFieldValue | undefined) => void
    className?: string
    isInvalid?: boolean
}

export function CustomCustomerFieldInput({
    id,
    field,
    value,
    onChange,
    onBlur,
    className,
    isInvalid,
}: CustomCustomerFieldInputProps) {
    if (isTextInput(field)) {
        return (
            <EditableField
                id={id}
                type="text"
                value={(value as string | undefined) ?? ''}
                onValueChange={onChange}
                onBlur={onBlur}
                placeholder={
                    field.definition.input_settings.placeholder || '+ Add'
                }
                className={className}
                ariaLabel={field.label}
                isInvalid={isInvalid}
            />
        )
    }

    if (isNumberInput(field)) {
        const { min, max } = field.definition.input_settings

        return (
            <EditableField
                id={id}
                type="number"
                value={getNumberOrUndefined(value)}
                onValueChange={onChange}
                onBlur={onBlur}
                minValue={toNumberOrUndefined(min)}
                maxValue={toNumberOrUndefined(max)}
                placeholder={
                    field.definition.input_settings.placeholder || '+ Add'
                }
                className={className}
                ariaLabel={field.label}
                isInvalid={isInvalid}
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
                    id={id}
                    choices={choices}
                    selectedValue={value as TreeValue}
                    onSelect={onChange}
                    placeholder="+ Add"
                    ariaLabel={field.label}
                    isInvalid={isInvalid}
                />
            </div>
        )
    }

    return null
}
