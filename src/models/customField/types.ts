export type CustomFieldTextInputTypes =
    CustomTypeDefinitionText['input_settings']['input_type']

export type CustomFieldValue = string | number | boolean

interface CustomFieldInputSettingsText {
    input_type: 'input'
    placeholder?: string
}

interface CustomFieldInputSettingsDropdown {
    input_type: 'dropdown'
    choices: CustomFieldValue[]
    default?: string
}

interface CustomTypeDefinitionText {
    data_type: 'text'
    input_settings:
        | CustomFieldInputSettingsText
        | CustomFieldInputSettingsDropdown
}
interface CustomTypeDefinitionBoolean {
    data_type: 'boolean'
    input_settings: CustomFieldInputSettingsDropdown
}

export interface CustomFieldInput {
    object_type: 'Ticket' | 'Customer'
    label: string
    description?: string
    priority?: number
    required: boolean
    definition: CustomTypeDefinitionText | CustomTypeDefinitionBoolean
}

export interface CustomField extends CustomFieldInput {
    id: number
    priority: number
    created_datetime: string
    updated_datetime: string
    deactivated_datetime: string | null
}

export type PartialCustomFieldWithId = Partial<CustomField> &
    Pick<CustomField, 'id'>

export type CustomFieldState = {
    id: CustomField['id']
    value?: CustomFieldValue
    hasError?: boolean
}

export type CustomFields = {
    [id: number]: CustomFieldState
}

export function isCustomField(
    field: CustomField | CustomFieldInput
): field is CustomField {
    return 'id' in field
}
