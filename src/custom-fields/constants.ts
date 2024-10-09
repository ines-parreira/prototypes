import {CustomFieldManagedType, CustomFieldObjectTypes} from './types'

export const OBJECT_TYPES = {
    TICKET: 'Ticket',
    CUSTOMER: 'Customer',
} as const

export const OBJECT_TYPE_SETTINGS: {
    [key in CustomFieldObjectTypes]: {
        LABEL: string
        TITLE_LABEL: string
        MAX_FIELDS: number
        PLACEHOLDERS: {
            LABEL: string
            DESCRIPTION: string
            DROPDOWN: Record<CustomFieldManagedType, string> & {DEFAULT: string}
        }
    }
} = {
    [OBJECT_TYPES.TICKET]: {
        LABEL: 'ticket',
        TITLE_LABEL: 'Ticket',
        MAX_FIELDS: 25,
        PLACEHOLDERS: {
            LABEL: 'e.g. Contact Reason',
            DESCRIPTION: 'e.g. Reasons why customers reach out to us',
            DROPDOWN: {
                DEFAULT: 'e.g. Shipping issue::Delay',
                contact_reason: 'e.g. Shipping issue::Delay',
                product: 'e.g. Men::Tops::Polo shirt',
                resolution: 'e.g. Order actions::Refund::Partial refund',
            },
        },
    },
    [OBJECT_TYPES.CUSTOMER]: {
        LABEL: 'customer',
        TITLE_LABEL: 'Customer',
        MAX_FIELDS: 4,
        PLACEHOLDERS: {
            LABEL: 'e.g. Customer Type',
            DESCRIPTION:
                'e.g. Capture customer type for easy recognition in future communications',
            DROPDOWN: {
                DEFAULT: 'e.g. Status::Membership::VIP',
                customer_type: 'e.g. Status::Membership::VIP',
            },
        },
    },
}

export const VALUE_TYPES = [
    {
        value: 'dropdown_text',
        icon: 'arrow_drop_down',
        name: 'Dropdown',
        description: 'Allow agents to select one option from a list',
    },
    {
        value: 'input_number_number',
        icon: 'tag',
        name: 'Number',
        description: 'Allow agents to add whole or decimal number',
    },
    {
        value: 'input_text',
        icon: 'title',
        name: 'Text',
        description: 'Allow agents to add descriptions, notes, or other text',
    },
    {
        value: 'dropdown_boolean',
        icon: 'check_box',
        name: 'Yes/No',
        description: 'Allow agents to mark as one of two states',
    },
]

export const AI_MANAGED_TYPES = {
    AI_INTENT: 'ai_intent',
    AI_OUTCOME: 'ai_outcome',
}

export const MANAGED_TYPES = {
    CONTACT_REASON: 'contact_reason',
    PRODUCT: 'product',
    RESOLUTION: 'resolution',
    CUSTOMER_TYPE: 'customer_type',
    ...AI_MANAGED_TYPES,
}

export const DROPDOWN_NESTING_DELIMITER = '::'

const csvTemplateData = [
    ['Exchange/Return', 'Change of mind'],
    ['Exchange/Return', 'Wrong color'],
    ['Exchange/Return', 'Wrong size'],
    ['Fulfilment', 'Missing item'],
    ['Fulfilment', 'Wrong item'],
    ['Order', 'Cancel'],
    ['Order', 'Change'],
    ['Pre-sale', 'Coupon/Discount'],
    ['Pre-sale', 'Notify when in stock'],
    ['Pre-sale', 'Question'],
    ['Pre-sale', 'Recommendation'],
    ['Pre-sale', 'Website questions'],
    ['Shipping', 'Arrived late'],
    ['Shipping', 'Damaged in Transit'],
    ['Shipping', 'Delivered Not Received'],
    ['Shipping', 'Lost in Transit'],
    ['Shipping', 'Tracking'],
    ['Shipping', 'WISMO'],
    ['Warranty & Damage', 'Broken', 'In Window'],
    ['Warranty & Damage', 'Broken', 'Outside Window'],
    ['Warranty & Damage', 'Question'],
]
export const DROPDOWN_CSV_TEMPLATE = csvTemplateData
    .map((row: string[]) => Array.from({...row, length: 3}).join(','))
    .join('\n')
