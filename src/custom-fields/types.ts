import {
    CustomFieldDefinition as ApiCustomFieldDefinition,
    ExpressionFieldType,
} from '@gorgias/helpdesk-types'

import { ApiPaginationParams } from 'models/api/types'

import {
    AI_MANAGED_TYPES,
    MANAGED_TYPES,
    OBJECT_TYPES,
    SUPPORTED_UI_DATA_TYPES,
} from './constants'

export type CustomFieldObjectTypes =
    (typeof OBJECT_TYPES)[keyof typeof OBJECT_TYPES]

export type RequirementType = 'required' | 'visible' | 'conditional'

export type ListParams = ApiPaginationParams & {
    archived?: boolean
    object_type: CustomFieldObjectTypes
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
        | CustomFieldInputSettingsDropdown,
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
    (typeof AI_MANAGED_TYPES)[keyof typeof AI_MANAGED_TYPES]

export type CustomFieldManagedType =
    (typeof MANAGED_TYPES)[keyof typeof MANAGED_TYPES]

export function isCustomFieldAIManagedType(
    managedType: string | null,
): managedType is CustomFieldAIManagedType {
    return Boolean(
        managedType && Object.values(AI_MANAGED_TYPES).includes(managedType),
    )
}

export type CustomFieldInput = {
    object_type: CustomFieldObjectTypes
    label: string
    description?: string
    priority?: number
    required: boolean
    requirement_type?: RequirementType
    managed_type: CustomFieldManagedType | null
    definition: CustomFieldDefinition
}

export type CustomField = CustomFieldInput & {
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
    field: CustomField | CustomFieldInput,
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

export type CustomFieldConditionsEvaluationResults = Record<
    number,
    ExpressionFieldType | undefined
>

export type ExhaustiveUIDataType =
    `${ApiCustomFieldDefinition['input_settings']['input_type']}_${ApiCustomFieldDefinition['data_type']}`

export type SupportedUIDataType =
    (typeof SUPPORTED_UI_DATA_TYPES)[keyof typeof SUPPORTED_UI_DATA_TYPES]
