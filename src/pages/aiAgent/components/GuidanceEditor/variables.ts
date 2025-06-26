import { GuidanceVariableGroup } from './variables.types'

export const guidanceVariables: GuidanceVariableGroup[] = [
    {
        name: 'Shopify',
        variables: [
            {
                name: 'Tags',
                value: '&&&customer.customer_tags&&&',
                category: 'customer',
            },
            {
                name: 'Full name',
                value: '&&&customer.name&&&',
                category: 'customer',
            },
            {
                name: 'Email',
                value: '&&&customer.email&&&',
                category: 'customer',
            },
            {
                name: 'Created datetime',
                value: '&&&order.created_datetime&&&',
                category: 'order',
            },
            {
                name: 'Tags',
                value: '&&&order.order_tags&&&',
                category: 'order',
            },
            {
                name: 'Notes',
                value: '&&&order.order_note&&&',
                category: 'order',
            },
            {
                name: 'Is cancelled',
                value: '&&&order.is_cancelled&&&',
                category: 'order',
            },
            {
                name: 'Shipping address - Line 1',
                value: '&&&order.shipping_address.address1&&&',
                category: 'order',
            },
            {
                name: 'Shipping address - Line 2',
                value: '&&&order.shipping_address.address2&&&',
                category: 'order',
            },
            {
                name: 'Shipping address - Province',
                value: '&&&order.shipping_address.province&&&',
                category: 'order',
            },
            {
                name: 'Shipping address - Province code',
                value: '&&&order.shipping_address.province_code&&&',
                category: 'order',
            },
            {
                name: 'Shipping address - Zip',
                value: '&&&order.shipping_address.zip&&&',
                category: 'order',
            },
            {
                name: 'Shipping address - City',
                value: '&&&order.shipping_address.city&&&',
                category: 'order',
            },
            {
                name: 'Shipping address - Country',
                value: '&&&order.shipping_address.country&&&',
                category: 'order',
            },
            {
                name: 'Fulfillment - Name',
                value: '&&&order.fulfillment.name&&&',
                category: 'order',
            },
            {
                name: 'Fulfillment - Status',
                value: '&&&order.fulfillment.gorgias_status&&&',
                category: 'order',
            },
            {
                name: 'Fulfillment - Time since order',
                value: '&&&order.fulfillment.time_since_order&&&',
                category: 'order',
            },
            {
                name: 'Fulfillment - Tracking URL',
                value: '&&&order.fulfillment.tracking_url&&&',
                category: 'order',
            },
            {
                name: 'Fulfillment - Tracking number',
                value: '&&&order.fulfillment.tracking_number&&&',
                category: 'order',
            },
            {
                name: 'Fulfillment - Created datetime',
                value: '&&&order.fulfillment.created_datetime&&&',
                category: 'order',
            },
            {
                name: 'Fulfillment - Line items',
                value: '&&&order.fulfillment.line_items&&&',
                category: 'order',
            },
        ],
    },
]

export const GUIDANCE_EDITOR_DEFAULT_MAX_CHARS = 5000
export const GUIDANCE_EDITOR_DEFAULT_HEIGHT = 320
export const GUIDANCE_EDITOR_DEFAULT_LABEL = 'Instructions'
export const GUIDANCE_EDITOR_DEFAULT_PLACEHOLDER =
    'e.g. If no order data is found for a customer asking a question about their order, you will ask the customer to confirm their order number and the email address.'
