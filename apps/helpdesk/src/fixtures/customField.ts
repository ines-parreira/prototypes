import {
    OBJECT_TYPES,
    SYSTEM_READ_ONLY_MANAGED_TYPES,
} from 'custom-fields/constants'
import type {
    CustomField,
    CustomFieldInput,
    CustomFieldInputSettingsDropdown,
    CustomFieldInputSettingsText,
    CustomTypeDefinitionBoolean,
    CustomTypeDefinitionNumber,
    CustomTypeDefinitionText,
    RequirementType,
} from 'custom-fields/types'

export const customFieldInputDefinition: CustomFieldInput = {
    object_type: OBJECT_TYPES.TICKET,
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
    object_type: OBJECT_TYPES.TICKET,
    required: false,
    managed_type: null,
    requirement_type: 'visible' as RequirementType,
    created_datetime: '2022-01-02T03:04:05.123456+00:00',
    updated_datetime: '2022-01-02T03:04:05.123456+00:00',
    deactivated_datetime: null,
}

const customerFieldBaseDefinition = {
    object_type: OBJECT_TYPES.CUSTOMER,
}

const archivedFieldBaseDefinitions = {
    deactivated_datetime: '2022-01-02T03:04:05.123456+00:00',
}

export const ticketInputFieldDefinition: CustomField & {
    definition: CustomTypeDefinitionText<CustomFieldInputSettingsText>
} = {
    ...fieldBaseDefinition,
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

export const ticketNumberFieldDefinition: CustomField & {
    definition: CustomTypeDefinitionNumber
} = {
    ...fieldBaseDefinition,
    id: 1234,
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

export const ticketDropdownFieldDefinition: CustomField & {
    definition: CustomTypeDefinitionText<CustomFieldInputSettingsDropdown>
} = {
    ...fieldBaseDefinition,
    id: 12345,
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

export const ticketBooleanFieldDefinition: CustomField & {
    definition: CustomTypeDefinitionBoolean
} = {
    ...fieldBaseDefinition,
    id: 123456,
    priority: 2,
    label: 'Yes/No field',
    description: 'This is a boolean field',
    requirement_type: 'required',
    definition: {
        data_type: 'boolean',
        input_settings: {
            input_type: 'dropdown',
            choices: [true, false],
        },
    },
}

export const customerInputFieldDefinition: CustomField & {
    definition: CustomTypeDefinitionText<CustomFieldInputSettingsText>
} = {
    ...ticketInputFieldDefinition,
    ...customerFieldBaseDefinition,
}

export const customerNumberFieldDefinition: CustomField & {
    definition: CustomTypeDefinitionNumber
} = {
    ...ticketNumberFieldDefinition,
    ...customerFieldBaseDefinition,
}

export const customerDropdownFieldDefinition: CustomField & {
    definition: CustomTypeDefinitionText<CustomFieldInputSettingsDropdown>
} = {
    ...ticketDropdownFieldDefinition,
    ...customerFieldBaseDefinition,
}

export const archivedTicketInputFieldDefinition: CustomField & {
    definition: CustomTypeDefinitionText<CustomFieldInputSettingsText>
} = {
    ...ticketInputFieldDefinition,
    ...archivedFieldBaseDefinitions,
}

export const ticketFieldDefinitions: CustomField[] = [
    ticketInputFieldDefinition,
    ticketDropdownFieldDefinition,
    ticketBooleanFieldDefinition,
    ticketNumberFieldDefinition,
]

export const customerFieldDefinitions: CustomField[] =
    ticketFieldDefinitions.map((definition) => ({
        ...definition,
        ...customerFieldBaseDefinition,
    }))

export const managedCustomerInputFieldDefinition: CustomField = {
    ...customerInputFieldDefinition,
    managed_type: 'customer_type',
}

export const managedTicketInputFieldDefinition: CustomField = {
    ...ticketInputFieldDefinition,
    managed_type: 'contact_reason',
}

export const productManagedTicketInputFieldDefinition: CustomField = {
    ...ticketInputFieldDefinition,
    managed_type: 'product',
}

export const aiManagedTicketInputFieldDefinition: CustomField = {
    ...ticketInputFieldDefinition,
    managed_type: 'ai_intent',
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

export const callStatusManagedTicketInputFieldDefinition: CustomField = {
    ...ticketInputFieldDefinition,
    managed_type: SYSTEM_READ_ONLY_MANAGED_TYPES.CALL_STATUS,
}

export const aiAgentManagedTicketDropdownFieldDefinition: CustomField = {
    ...ticketInputFieldDefinition,
    id: 1234567,
    priority: 2,
    label: 'Dropdown field',
    managed_type: 'ai_intent',
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

export const customFieldsMockResponse = {
    object: 'list',
    uri: '/api/custom-fields/?archived=false&object_type=Ticket',
    data: [
        {
            id: 5081,
            external_id: null,
            object_type: OBJECT_TYPES.TICKET,
            label: 'ZAI Agent Contact Reason',
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
            object_type: OBJECT_TYPES.TICKET,
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
