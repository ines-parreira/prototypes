interface CustomFieldSettingsText {
    type: 'text'
    placeholder?: string
}

export interface CustomFieldInput {
    entity_type: 'ticket'
    name: string
    description?: string
    order: number
    value_required: boolean
    value_type_settings: CustomFieldSettingsText
}

export interface CustomField extends CustomFieldInput {
    id: number
    created_datetime: string
    updated_datetime: string
    deactivated_datetime: string | null
}
