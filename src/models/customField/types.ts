export type CustomFieldTextInputTypes =
    CustomTypeDefinitionText['input_settings']['input_type']

interface CustomFieldInputSettingsText {
    input_type: 'input'
    placeholder?: string
}

interface CustomFieldInputSettingsDropdown {
    input_type: 'dropdown'
    choices: string[]
    default?: string
}

interface CustomTypeDefinitionText {
    data_type: 'text'
    input_settings:
        | CustomFieldInputSettingsText
        | CustomFieldInputSettingsDropdown
}

export interface CustomFieldInput {
    object_type: 'Ticket' | 'Customer'
    label: string
    description?: string
    priority?: number
    required: boolean
    definition: CustomTypeDefinitionText
}

export interface CustomField extends CustomFieldInput {
    id: number
    priority: number
    created_datetime: string
    updated_datetime: string
    deactivated_datetime: string | null
}

export type CustomFieldState = {
    id: CustomField['id']
    value?: string | number
    hasError?: boolean
}

export type CustomFields = {
    [id: number]: CustomFieldState | undefined
}

export function isCustomField(
    field: CustomField | CustomFieldInput
): field is CustomField {
    return 'id' in field
}
