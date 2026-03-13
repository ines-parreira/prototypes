import type { GuidanceVariableGroup } from './variables.types'

export const guidanceVariables: GuidanceVariableGroup[] = [
    {
        name: 'Ticket',
        variables: [
            {
                name: 'Creation date',
                value: '&&&ticket.created_at&&&',
                category: 'ticket',
            },
        ],
    },
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
                name: 'Note',
                value: '&&&customer.note&&&',
                category: 'customer',
            },
            {
                name: 'Order count',
                value: '&&&customer.orders_count&&&',
                category: 'customer',
            },
            {
                name: 'Discount codes',
                value: '&&&order.discount_codes&&&',
                category: 'order',
            },
            {
                name: 'Total spent',
                value: '&&&customer.total_spent&&&',
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
                name: 'Shipping method',
                value: '&&&order.shipping_lines.title&&&',
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
            {
                name: 'Fulfillment - Tracking company',
                value: '&&&order.fulfillment.tracking_company&&&',
                category: 'order',
            },
            {
                name: 'Fulfillment - Last updated datetime',
                value: '&&&order.fulfillment.updated_at&&&',
                category: 'order',
            },
            {
                name: 'Fulfillment - Location id',
                value: '&&&order.fulfillment.location_id&&&',
                category: 'order',
            },
            {
                name: 'Fulfillment - Service',
                value: '&&&order.fulfillment.service&&&',
                category: 'order',
            },
            {
                name: 'Currency',
                value: '&&&order.currency&&&',
                category: 'order',
            },
            {
                name: 'Total price',
                value: '&&&order.current_total_price&&&',
                category: 'order',
            },
            {
                name: 'Total tax',
                value: '&&&order.current_total_tax&&&',
                category: 'order',
            },
            {
                name: 'Financial status',
                value: '&&&order.financial_status&&&',
                category: 'order',
            },
            {
                name: 'Id',
                value: '&&&order.id&&&',
                category: 'order',
            },
            {
                name: 'Name',
                value: '&&&order.name&&&',
                category: 'order',
            },
            {
                name: 'Payment gateway name',
                value: '&&&order.payment_gateway_names&&&',
                category: 'order',
            },
            {
                name: 'Note',
                value: '&&&order.note&&&',
                category: 'order',
            },
            {
                name: 'Order status URL',
                value: '&&&order.order_status_url&&&',
                category: 'order',
            },
            {
                name: 'Total weight',
                value: '&&&order.total_weight&&&',
                category: 'order',
            },
            {
                name: 'Shipment - Status',
                value: '&&&order.fulfillment.shipment_status&&&',
                category: 'order',
            },
            {
                name: 'Refund - Processed at',
                value: '&&&order.refund.processed_at&&&',
                category: 'order',
            },
            {
                name: 'Return - Received at',
                value: '&&&order.return.received_at&&&',
                category: 'order',
            },
            {
                name: 'Return - Closed at',
                value: '&&&order.return.closed_at&&&',
                category: 'order',
            },
        ],
    },
]

export const GUIDANCE_EDITOR_DEFAULT_LABEL = 'Instructions'
