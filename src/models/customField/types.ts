import {ApiPaginationParams} from 'models/api/types'

export type ListParams = ApiPaginationParams & {
    archived?: boolean
    object_type: CustomFieldInput['object_type']
    search?: string
}

export type CustomFieldDefinition =
    | CustomTypeDefinitionText
    | CustomTypeDefinitionBoolean
    | CustomTypeDefinitionNumber

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

interface CustomFieldInputSettingsNumber {
    input_type: 'input_number'
    min?: string
    max?: string
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
interface CustomTypeDefinitionNumber {
    data_type: 'number'
    input_settings: CustomFieldInputSettingsNumber
}

export type CustomFieldManagedType = 'contact_reason' | 'product' | 'resolution'

export interface CustomFieldInput {
    object_type: 'Ticket' | 'Customer'
    label: string
    description?: string
    priority?: number
    required: boolean
    managed_type: CustomFieldManagedType | null
    definition: CustomFieldDefinition
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
    prediction?: CustomFieldPrediction
}

export type CustomFields = {
    [id: number]: CustomFieldState
}

export function isCustomField(
    field: CustomField | CustomFieldInput
): field is CustomField {
    return 'id' in field
}

export type CustomFieldPrediction = {
    confidence: number
    confirmed: boolean
    display: boolean
    modified: boolean
    predicted: string
}
