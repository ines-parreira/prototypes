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

export const customFieldsMockReponse = {
    object: 'list',
    uri: '/api/custom-fields/?archived=false&object_type=Ticket',
    data: [
        {
            id: 5081,
            external_id: null,
            object_type: 'Ticket',
            label: 'AI Agent Contact Reason',
            description: 'AI Agent contact reason categories',
            priority: 8,
            required: false,
            managed_type: null,
            definition: {
                input_settings: {
                    choices: [
                        'Pre-sale::Uncategorized',
                        'Order::Uncategorized',
                        'Shipping::Uncategorized',
                        'Warranty::Uncategorized',
                        'Exchange::Uncategorized',
                        'Return::Uncategorized',
                        'Feedback::Uncategorized',
                        'Subscription::Uncategorized',
                        'Wholesale::Uncategorized',
                        'Marketing::Uncategorized',
                        'Other::Uncategorized',
                    ],
                    input_type: 'dropdown',
                },
                data_type: 'text',
            },
            created_datetime: '2024-07-29T09:09:41.626092+00:00',
            updated_datetime: '2024-07-29T09:09:41.626097+00:00',
            deactivated_datetime: null,
        },
        {
            id: 4979,
            external_id: null,
            object_type: 'Ticket',
            label: 'AI Agent Outcome',
            description: 'AI Agent computed outcome for ticket',
            priority: 7,
            required: false,
            managed_type: null,
            definition: {
                input_settings: {
                    choices: [
                        'Handover::With message',
                        'Handover::Without message',
                        'Close::With message',
                        'Close::Without message',
                        'Snooze::With message',
                    ],
                    input_type: 'dropdown',
                },
                data_type: 'text',
            },
            created_datetime: '2024-07-15T17:05:25.778110+00:00',
            updated_datetime: '2024-07-15T17:05:25.778116+00:00',
            deactivated_datetime: null,
        },
    ],
    meta: {
        prev_cursor: null,
        next_cursor: null,
    },
}
