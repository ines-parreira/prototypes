import {ApiPaginationParams} from 'models/api/types'
import {AI_MANAGED_TYPES, OBJECT_TYPES, MANAGED_TYPES} from './constants'

export type CustomFieldObjectTypes =
    typeof OBJECT_TYPES[keyof typeof OBJECT_TYPES]

export type ListParams = ApiPaginationParams & {
    archived?: boolean
    object_type: CustomFieldInput['object_type']
    search?: string
}

export type CustomFieldValue = string | number | boolean

export type CustomFieldDefinition =
    | CustomTypeDefinitionText
    | CustomTypeDefinitionBoolean
    | CustomTypeDefinitionNumber

export interface CustomTypeDefinitionText<
    InputSettings =
        | CustomFieldInputSettingsText
        | CustomFieldInputSettingsDropdown
> {
    data_type: 'text'
    input_settings: InputSettings
}
export interface CustomTypeDefinitionBoolean {
    data_type: 'boolean'
    input_settings: CustomFieldInputSettingsDropdown
}
export interface CustomTypeDefinitionNumber {
    data_type: 'number'
    input_settings: CustomFieldInputSettingsNumber
}

export interface CustomFieldInputSettingsText {
    input_type: 'input'
    placeholder?: string
}

export interface CustomFieldInputSettingsDropdown {
    input_type: 'dropdown'
    choices: CustomFieldValue[]
    default?: string
}

interface CustomFieldInputSettingsNumber {
    input_type: 'input_number'
    min?: string
    max?: string
}

export type CustomFieldAIManagedType =
    typeof AI_MANAGED_TYPES[keyof typeof AI_MANAGED_TYPES]

export type CustomFieldManagedType =
    typeof MANAGED_TYPES[keyof typeof MANAGED_TYPES]

export function isCustomFieldAIManagedType(
    managedType: string | null
): managedType is CustomFieldAIManagedType {
    return Boolean(
        managedType && Object.values(AI_MANAGED_TYPES).includes(managedType)
    )
}

export interface CustomFieldInput {
    object_type: CustomFieldObjectTypes
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
