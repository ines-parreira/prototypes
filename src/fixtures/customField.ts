import {CustomField, CustomFieldInput} from 'models/customField/types'

export const customFieldInput: CustomFieldInput = {
    object_type: 'Ticket',
    label: 'Test field',
    priority: 123,
    required: false,
    definition: {
        data_type: 'text',
        input_settings: {
            input_type: 'input',
            placeholder: 'Test placeholder',
        },
    },
}

export const customField: CustomField = {
    ...customFieldInput,
    id: 123,
    created_datetime: '2022-01-02T03:04:05.123456+00:00',
    updated_datetime: '2022-01-02T03:04:05.123456+00:00',
    deactivated_datetime: null,
}
