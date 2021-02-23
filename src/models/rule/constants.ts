import {
    IdentifierCategoryKey,
    IdentifierCategoryValue,
    IdentifierElement,
    IdentifierSubCategoryValue,
} from './types'

export const IDENTIFIER_CATEGORIES: {
    label: IdentifierCategoryValue
    value: IdentifierCategoryKey
}[] = [
    {
        label: IdentifierCategoryValue.Message,
        value: IdentifierCategoryKey.Message,
    },
    {
        label: IdentifierCategoryValue.Ticket,
        value: IdentifierCategoryKey.Ticket,
    },
    {
        label: IdentifierCategoryValue.Customer,
        value: IdentifierCategoryKey.Customer,
    },
    {
        label: IdentifierCategoryValue.ShopifyLastOrder,
        value: IdentifierCategoryKey.ShopifyLastOrder,
    },
    {
        label: IdentifierCategoryValue.ShopifyCustomer,
        value: IdentifierCategoryKey.ShopifyCustomer,
    },
    {
        label: IdentifierCategoryValue.Magento2LastOrder,
        value: IdentifierCategoryKey.Magento2LastOrder,
    },
    {
        label: IdentifierCategoryValue.Magento2Customer,
        value: IdentifierCategoryKey.Magento2Customer,
    },
    {
        label: IdentifierCategoryValue.RechargeLastSubscription,
        value: IdentifierCategoryKey.RechargeLastSubscription,
    },
    {
        label: IdentifierCategoryValue.RechargeCustomer,
        value: IdentifierCategoryKey.RechargeCustomer,
    },
    {
        label: IdentifierCategoryValue.SmileCustomer,
        value: IdentifierCategoryKey.SmileCustomer,
    },
]

export const IDENTIFIER_VARIABLES_BY_CATEGORY: {
    [key in IdentifierCategoryKey]: (
        | (IdentifierElement & {children?: undefined})
        | {
              label: IdentifierSubCategoryValue
              children: IdentifierElement[]
              value?: undefined
          }
    )[]
} = {
    [IdentifierCategoryKey.Message]: [
        {
            label: 'channel',
            text: 'message channel',
            value: 'message.channel',
        },
        {
            label: 'created date',
            text: 'message created date',
            value: 'message.created_datetime',
        },
        {
            label: 'from agent',
            text: 'message from agent',
            value: 'message.from_agent',
        },
        {
            label: 'integration',
            text: 'message integration',
            value: 'message.integration_id',
        },
        {
            label: 'intents',
            text: 'message intents',
            value: 'message.intents.name',
        },
        {
            label: 'public',
            text: 'message public',
            value: 'message.public',
        },
        {
            label: 'sent date',
            text: 'sent date of message',
            value: 'message.sent_datetime',
        },
        {
            label: 'sentiments',
            text: 'message sentiments',
            value: 'message.sentiments.name',
        },
        {
            label: 'body',
            text: 'message body',
            value: 'message.text',
        },
        {
            label: 'via',
            text: 'message via',
            value: 'message.via',
        },
        {
            label: IdentifierSubCategoryValue.Receiver,
            children: [
                {
                    label: 'receiver email',
                    text: 'message receiver email',
                    value: 'message.receiver.email',
                },
            ],
        },
        {
            label: IdentifierSubCategoryValue.Sender,
            children: [
                {
                    label: 'sender customer',
                    text: 'message sender customer',
                    value: 'message.sender.customer',
                },
                {
                    label: 'sender email',
                    text: 'message sender email',
                    value: 'message.sender.email',
                },
            ],
        },
        {
            label: IdentifierSubCategoryValue.Source,
            children: [
                {
                    label: 'from address',
                    text: 'message source from address',
                    value: 'message.source.from.address',
                },
                {
                    label: 'from name',
                    text: 'message source from name',
                    value: 'message.source.from.name',
                },
            ],
        },
    ],
    [IdentifierCategoryKey.Ticket]: [
        {
            label: 'assignee team',
            text: 'ticket assignee team',
            value: 'ticket.assignee_team_id',
        },
        {
            label: 'assignee user email',
            text: 'ticket assignee user email',
            value: 'ticket.assignee_user.email',
        },
        {
            label: 'channel',
            text: 'ticket channel',
            value: 'ticket.channel',
        },
        {
            label: 'created date',
            text: 'created date of ticket',
            value: 'ticket.created_datetime',
        },
        {
            label: 'from agent',
            text: 'ticket from agent',
            value: 'ticket.from_agent',
        },
        {
            label: 'language',
            text: 'ticket language',
            value: 'ticket.language',
        },
        {
            label: 'last message date',
            text: 'date of last message in ticket',
            value: 'ticket.last_message_datetime',
        },
        {
            label: 'last received message date',
            text: 'date of last received message in ticket',
            value: 'ticket.last_received_message_datetime',
        },
        {
            label: 'spam',
            text: 'ticket spam',
            value: 'ticket.spam',
        },
        {
            label: 'status',
            text: 'ticket status',
            value: 'ticket.status',
        },
        {
            label: 'subject',
            text: 'ticket subject',
            value: 'ticket.subject',
        },
        {
            label: 'tags',
            text: 'ticket tags',
            value: 'ticket.tags.name',
        },
        {
            label: 'via',
            text: 'ticket via',
            value: 'ticket.via',
        },
    ],
    [IdentifierCategoryKey.Customer]: [
        {
            label: 'data',
            text: 'customer data',
            value: 'ticket.customer.data',
        },
        {
            label: 'email',
            text: 'customer email',
            value: 'ticket.customer.email',
        },
        {
            label: 'other integrations',
            text: 'customer other integrations',
            value: 'ticket.customer.integrations.other',
        },
    ],
    [IdentifierCategoryKey.ShopifyLastOrder]: [
        {
            label: 'created date',
            text: 'date of last order',
            value: 'ticket.customer.integrations.shopify.last_order.created_at',
        },
        {
            label: 'financial status',
            text: 'last order financial status',
            value:
                'ticket.customer.integrations.shopify.last_order.financial_status',
        },
        {
            label: 'fulfillment status',
            text: 'last order fulfillment status',
            value:
                'ticket.customer.integrations.shopify.last_order.fulfillment_status',
        },
        {
            label: 'tags',
            text: 'last order tags',
            value: 'ticket.customer.integrations.shopify.last_order.tags',
        },
        {
            label: 'total price',
            text: 'total price of last order',
            value:
                'ticket.customer.integrations.shopify.last_order.total_price',
        },
        {
            label: IdentifierSubCategoryValue.LastFulfillment,
            children: [
                {
                    label: 'created date',
                    text: 'shipping date of last order',
                    value:
                        'ticket.customer.integrations.shopify.last_order.last_fulfillment.created_at',
                },
                {
                    label: 'shipment status',
                    text: 'last order shipment status',
                    value:
                        'ticket.customer.integrations.shopify.last_order.last_fulfillment.shipment_status',
                },
                {
                    label: 'status',
                    text: 'last fulfillment status',
                    value:
                        'ticket.customer.integrations.shopify.last_order.last_fulfillment.status',
                },
                {
                    label: 'tracking number',
                    text: 'last order tracking numbner',
                    value:
                        'ticket.customer.integrations.shopify.last_order.last_fulfillment.tracking_number',
                },
            ],
        },
        {
            label: IdentifierSubCategoryValue.ShippingAddress,
            children: [
                {
                    label: 'country',
                    text: 'destination country of last order',
                    value:
                        'ticket.customer.integrations.shopify.last_order.shipping_address.country',
                },
                {
                    label: 'state',
                    text: 'destination state of last order',
                    value: 'message.source.from.address',
                },
            ],
        },
    ],
    [IdentifierCategoryKey.ShopifyCustomer]: [
        {
            label: 'created date',
            text: 'customer created date',
            value: 'ticket.customer.integrations.shopify.customer.created_at',
        },
        {
            label: 'orders count',
            text: 'customer order count',
            value: 'ticket.customer.integrations.shopify.customer.orders_count',
        },
        {
            label: 'tags',
            text: 'customer tags',
            value: 'ticket.customer.integrations.shopify.customer.tags',
        },
        {
            label: 'total spent',
            text: 'customer total spent',
            value: 'ticket.customer.integrations.shopify.customer.total_spent',
        },
    ],
    [IdentifierCategoryKey.Magento2LastOrder]: [
        {
            label: 'date of last order',
            text: 'date of last order',
            value:
                'ticket.customer.integrations.magento2.last_order.created_at',
        },
        {
            label: 'grand total',
            text: 'last order grand total',
            value:
                'ticket.customer.integrations.magento2.last_order.grand_total',
        },
        {
            label: 'created date',
            text: 'shipping date of last order',
            value:
                'ticket.customer.integrations.magento2.last_order.last_shipment.created_at',
        },
        {
            label: 'state',
            text: 'last order state',
            value: 'ticket.customer.integrations.magento2.last_order.state',
        },
    ],
    [IdentifierCategoryKey.Magento2Customer]: [
        {
            label: 'created date',
            text: 'created date of customer',
            value: 'ticket.customer.integrations.magento2.customer.created_at',
        },
    ],
    [IdentifierCategoryKey.RechargeLastSubscription]: [
        {
            label: 'created date',
            text: 'created date of last subscription',
            value:
                'ticket.customer.integrations.recharge.last_subscription.created_at',
        },
        {
            label: 'date of next scheduled charge',
            text: 'next scheduled charge date of last subscription',
            value:
                'ticket.customer.integrations.recharge.last_subscription.next_charge_scheduled_at',
        },
        {
            label: 'product title',
            text: 'last subscription product title',
            value:
                'ticket.customer.integrations.recharge.last_subscription.product_title',
        },
    ],
    [IdentifierCategoryKey.RechargeCustomer]: [
        {
            label: 'status',
            text: 'customer status',
            value: 'ticket.customer.integrations.recharge.customer.status',
        },
    ],
    [IdentifierCategoryKey.SmileCustomer]: [
        {
            label: 'point balance',
            text: 'customer point balance',
            value: 'ticket.customer.integrations.smile.customer.point_balance',
        },
        {
            label: 'state',
            text: 'customer state',
            value: 'ticket.customer.integrations.smile.customer.state',
        },
        {
            label: 'vip tier',
            text: 'customer vip tier',
            value: 'ticket.customer.integrations.smile.customer.vip_tier.name',
        },
    ],
}

//$TsFixMe remove this constant on FlowJS removal
export const IDENTIFIER_CATEGORY_KEYS = Object.freeze({
    MESSAGE: 'message',
    TICKET: 'ticket',
    CUSTOMER: 'customer',
    SHOPIFY_LAST_ORDER: 'shopifyLastOrder',
    SHOPIFY_CUSTOMER: 'shopifyCustomer',
    MAGENTO2_LAST_ORDER: 'magento2LastOrder',
    MAGENTO2_CUSTOMER: 'magento2Customer',
    RECHARGE_LAST_SUBSCRIPTION: 'rechargeLastSubscription',
    RECHARGE_CUSTOMER: 'rechargeCustomer',
    SMILE_CUSTOMER: 'smileCustomer',
})

//$TsFixMe remove this constant on FlowJS removal
export const IDENTIFIER_CATEGORY_VALUES = Object.freeze({
    MESSAGE: 'Message',
    TICKET: 'Ticket',
    CUSTOMER: 'Customer',
    MAGENTO2_CUSTOMER: 'Magento2 Customer',
    MAGENTO2_LAST_ORDER: 'Magento2 Last Order',
    RECHARGE_CUSTOMER: 'Recharge Customer',
    RECHARGE_LAST_SUBSCRIPTION: 'Recharge Last Subscription',
    SHOPIFY_CUSTOMER: 'Shopify Customer',
    SHOPIFY_LAST_ORDER: 'Shopify Last Order',
    SMILE_CUSTOMER: 'Smile Customer',
})

//$TsFixMe remove this constant on FlowJS removal
export const IDENTIFIER_SUBCATEGORY_VALUES = Object.freeze({
    RECEIVER: 'Receiver',
    SENDER: 'Sender',
    SOURCE: 'Source',
    LAST_FULFILLMENT: 'Last Fulfillement',
    SHIPPING_ADDRESS: 'Shipping Address',
})

//$TsFixMe remove this constant on FlowJS removal
export const IDENTIFIER_VARIABLE_NAMES = Object.freeze({
    CHANNEL: 'channel',
    CREATED_DATE: 'created date',
    FROM_AGENT: 'from agent',
    INTEGRATION: 'integration',
    INTENTS: 'intents',
    PUBLIC: 'public',
    RECEIVER_EMAIL: 'receiver email',
    SENT_DATE: 'sent date',
    SENDER_EMAIL: 'sender email',
    SENTIMENTS: 'sentiments',
    FROM_ADDRESS: 'from address',
    FROM_NAME: 'from name',
    BODY: 'body',
    VIA: 'via',
    ASSIGNEE_TEAM: 'assignee team',
    ASSIGNEE_USER_EMAIL: 'assignee user email',
    DATA: 'data',
    EMAIL: 'email',
    DATE_OF_LAST_ORDER: 'date of last order',
    GRAND_TOTAL: 'grand total',
    STATE: 'state',
    OTHER_INTEGRATIONS: 'other integrations',
    STATUS: 'status',
    DATE_NEXT_SCHEDULED_CHARGE: 'date of next scheduled charge',
    PRODUCT_TITLE: 'product title',
    ORDERS_COUNT: 'orders count',
    TAGS: 'tags',
    TOTAL_SPENT: 'total spent',
    FINANCIAL_STATUS: 'financial status',
    FULFILLEMENT_STATUS: 'fulfillment status',
    SHIPMENT_STATUS: 'shipment status',
    TRACKING_NUMBER: 'tracking number',
    COUNTRY: 'country',
    TOTAL_PRICE: 'total price',
    POINT_BALANCE: 'point balance',
    VIP_TIER: 'vip tier',
    LANGUAGE: 'language',
    LAST_MESSAGE_DATA: 'last message date',
    LAST_RECEIVED_MESSAGE_DATA: 'last received message date',
    SPAM: 'spam',
    SUBJET: 'subject',
})
