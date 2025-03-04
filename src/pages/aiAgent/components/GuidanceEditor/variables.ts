import { GuidanceVariableGroup } from './variables.types'

export const guidanceVariables: GuidanceVariableGroup[] = [
    {
        name: 'Shopify',
        variables: [
            {
                name: 'Email',
                value: '&&&customer.email&&&',
                category: 'customer',
            },
            {
                name: 'ID',
                value: '&&&customer.id&&&',
                category: 'customer',
            },
            {
                name: 'Name',
                value: '&&&customer.name&&&',
                category: 'customer',
            },
            {
                name: 'First name',
                value: '&&&customer.first_name&&&',
                category: 'customer',
            },
            {
                name: 'Last name',
                value: '&&&customer.last_name&&&',
                category: 'customer',
            },
            {
                name: 'Order count',
                value: '&&&customer.order_count&&&',
                category: 'customer',
            },
            {
                name: 'Total spent',
                value: '&&&customer.total_spent&&&',
                category: 'customer',
            },
            {
                name: 'Order ID',
                value: '&&&order.id&&&',
                category: 'order',
            },
            {
                name: 'Shop name',
                value: '&&&order.shop_name&&&',
                category: 'order',
            },
            {
                name: 'Order number',
                value: '&&&order.order_number&&&',
                category: 'order',
            },
            {
                name: 'Order status URL',
                value: '&&&order.order_status_url&&&',
                category: 'order',
            },
            {
                name: 'Shipping address - Address 1',
                value: '&&&order.shipping_address.address1&&&',
                category: 'order',
            },
            {
                name: 'Shipping address - Address 2',
                value: '&&&order.shipping_address.address2&&&',
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
                name: 'Fulfillment status',
                value: '&&&order.fulfillment_status&&&',
                category: 'order',
            },
        ],
    },
]
