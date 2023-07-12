import {CustomField, CustomFieldInput} from 'models/customField/types'

export const customFieldInputDefinition: CustomFieldInput = {
    object_type: 'Ticket',
    label: 'Test field',
    priority: 123,
    required: false,
    managed_type: null,
    definition: {
        data_type: 'text',
        input_settings: {
            input_type: 'input',
            placeholder: 'Test placeholder',
        },
    },
}

const fieldBaseDefinition = {
    created_datetime: '2022-01-02T03:04:05.123456+00:00',
    updated_datetime: '2022-01-02T03:04:05.123456+00:00',
    deactivated_datetime: null,
}

const ticketFieldBaseDefinition = {
    ...fieldBaseDefinition,
    required: false,
    managed_type: null,
    object_type: 'Ticket',
} as const

export const ticketInputFieldDefinition: CustomField = {
    ...ticketFieldBaseDefinition,
    id: 123,
    priority: 1,
    label: 'Input field',
    description: 'This is an input field',
    definition: {
        data_type: 'text',
        input_settings: {
            input_type: 'input',
            placeholder: 'Some placeholder',
        },
    },
}

export const ticketNumberFieldDefinition: CustomField = {
    ...ticketFieldBaseDefinition,
    id: 123,
    priority: 1,
    label: 'Number field',
    description: 'This is a number field',
    definition: {
        data_type: 'number',
        input_settings: {
            input_type: 'input_number',
            min: '1',
            max: '10',
        },
    },
}

export const ticketDropdownFieldDefinition: CustomField = {
    ...ticketFieldBaseDefinition,
    id: 2,
    priority: 2,
    label: 'Dropdown field',
    description: 'This is a dropdown field',
    definition: {
        data_type: 'text',
        input_settings: {
            input_type: 'dropdown',
            choices: [
                'Choice 1',
                'Choice 2',
                'Choice 3::Sub 2::Sub 3::Sub 4::Sub 5',
            ],
        },
    },
}

export const ticketBooleanDefinition: CustomField = {
    ...ticketFieldBaseDefinition,
    id: 2,
    priority: 2,
    label: 'Yes/No field',
    description: 'This is a boolean field',
    definition: {
        data_type: 'boolean',
        input_settings: {
            input_type: 'dropdown',
            choices: [true, false],
        },
    },
}

export const ticketFieldDefinitions: CustomField[] = [
    ticketInputFieldDefinition,
    ticketDropdownFieldDefinition,
    ticketBooleanDefinition,
    ticketNumberFieldDefinition,
]

export const managedTicketInputFieldDefinition: CustomField = {
    ...ticketFieldBaseDefinition,
    managed_type: 'contact_reason',
    id: 123,
    priority: 1,
    label: 'Contact reason',
    description: 'This is a managed input field',
    definition: {
        data_type: 'text',
        input_settings: {
            input_type: 'input',
            placeholder: 'Some placeholder',
        },
    },
}
