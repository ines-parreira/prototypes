import {
    CustomField,
    CustomFieldInputSettingsDropdown,
    CustomFieldInputSettingsText,
    CustomTypeDefinitionBoolean,
    CustomTypeDefinitionNumber,
    CustomTypeDefinitionText,
} from 'custom-fields/types'

export function isTextInput(field: CustomField): field is
    | CustomField & {
          definition: CustomTypeDefinitionText<CustomFieldInputSettingsText>
      } {
    return (
        field.definition.input_settings.input_type === 'input' &&
        field.definition.data_type === 'text'
    )
}

export function isNumberInput(field: CustomField): field is CustomField & {
    definition: CustomTypeDefinitionNumber
} {
    return (
        field.definition.input_settings.input_type === 'input_number' &&
        field.definition.data_type === 'number'
    )
}

export function isDropdownInput(field: CustomField): field is CustomField & {
    definition:
        | CustomTypeDefinitionText<CustomFieldInputSettingsDropdown>
        | CustomTypeDefinitionBoolean
} {
    return (
        field.definition.input_settings.input_type === 'dropdown' &&
        ['text', 'boolean'].includes(field.definition.data_type)
    )
}
