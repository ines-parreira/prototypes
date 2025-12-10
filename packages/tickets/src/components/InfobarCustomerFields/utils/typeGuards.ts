// Migrated from (with the correct helpdesk-types imports): apps/helpdesk/src/custom-fields/helpers/typeGuards.ts
import type {
    BooleanDataTypeDefinition,
    CustomField,
    NumberDataTypeDefinition,
    TextDataTypeDefinition,
    TextInputSettings,
} from '@gorgias/helpdesk-types'
import {
    BooleanDataTypeDefinitionDataType,
    DropdownInputSettingsSettingsInputType,
    InputSettingsNumberInputType,
    InputSettingsTextInputType,
    NumberDataTypeDefinitionDataType,
    TextDataTypeDefinitionDataType,
} from '@gorgias/helpdesk-types'

export function isTextInput(field: CustomField): field is CustomField & {
    definition: TextDataTypeDefinition & {
        input_settings: TextInputSettings
    }
} {
    return (
        field.definition.input_settings.input_type ===
            InputSettingsTextInputType.Input &&
        field.definition.data_type === TextDataTypeDefinitionDataType.Text
    )
}

export function isNumberInput(field: CustomField): field is CustomField & {
    definition: NumberDataTypeDefinition
} {
    return (
        field.definition.input_settings.input_type ===
            InputSettingsNumberInputType.InputNumber &&
        field.definition.data_type === NumberDataTypeDefinitionDataType.Number
    )
}

export function isDropdownInput(field: CustomField): field is CustomField & {
    definition: TextDataTypeDefinition | BooleanDataTypeDefinition
} {
    return (
        field.definition.input_settings.input_type ===
            DropdownInputSettingsSettingsInputType.Dropdown &&
        (field.definition.data_type === TextDataTypeDefinitionDataType.Text ||
            field.definition.data_type ===
                BooleanDataTypeDefinitionDataType.Boolean)
    )
}
