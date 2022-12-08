import {CustomField, CustomFieldInput} from 'models/customField/types'

export const customFieldInput: CustomFieldInput = {
    entity_type: 'ticket',
    name: 'Test field',
    order: 123,
    value_required: false,
    value_type_settings: {
        type: 'text',
        placeholder: 'Test placeholder',
    },
}

export const customField: CustomField = {
    ...customFieldInput,
    id: 123,
    created_datetime: '2022-01-02T03:04:05.123456+00:00',
    updated_datetime: '2022-01-02T03:04:05.123456+00:00',
    deactivated_datetime: null,
}
