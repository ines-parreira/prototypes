import {IntegrationType} from '../../models/integration/types'

export const RECHARGE_DEFAULT_CANCELLATION_REASON = 'Cancelled with Gorgias'
export const RECHARGE_CANCELLATION_REASONS = [
    'This is too expensive',
    'This was created by accident',
    'I already have more than I need',
    'I need it sooner',
    'I no longer use this product',
    'I want a different product or variety',
    RECHARGE_DEFAULT_CANCELLATION_REASON,
]

export const MACRO_VARIABLES = {
    type: IntegrationType.Recharge,
    integration: true,
    name: 'Recharge',
    children: [
        {
            name: 'Hash of customer',
            value: '{{ticket.customer.integrations.recharge.customer.hash}}',
        },
        {
            name: 'Quantity of last subscription',
            value:
                '{{ticket.customer.integrations.recharge.subscriptions[0].quantity}}',
        },
        {
            name: 'Product title of last subscription',
            value:
                '{{ticket.customer.integrations.recharge.subscriptions[0].product_title}}',
        },
        {
            name: 'Order interval frequency of last subscription',
            value:
                '{{ticket.customer.integrations.recharge.subscriptions[0].order_interval_frequency}}',
        },
        {
            name: 'Order interval unit of last subscription',
            value:
                '{{ticket.customer.integrations.recharge.subscriptions[0].order_interval_unit}}',
        },
        {
            name: 'Price of last subscription',
            value:
                '{{ticket.customer.integrations.recharge.subscriptions[0].price}}',
        },
        {
            name: 'Scheduled date of next charge of last subscription',
            value:
                '{{ticket.customer.integrations.recharge.subscriptions[0].next_charge_scheduled_at|datetime_format("MM/d/YYYY")}}',
        },
    ],
}

export const MACRO_PREVIOUS_VARIABLES = {
    type: IntegrationType.Recharge,
    name: 'Recharge',
    integration: true,
    children: [
        {
            name: 'Hash of customer',
            value: '{{ticket.customer.integrations.recharge.customer.hash}}',
        },
        {
            name: 'Scheduled date of next charge of last subscription',
            value:
                '{{ticket.customer.integrations.recharge.subscriptions[0].next_charge_scheduled_at|datetime_format("L")}}',
        },
    ],
}
