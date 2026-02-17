import { ORDER_MANAGEMENT } from 'pages/automate/common/components/constants'

import type { IdentifierElement } from './types'
import {
    CustomFieldTreePath,
    IdentifierCategoryKey,
    IdentifierCategoryValue,
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
        label: IdentifierCategoryValue.ShopifyCustomerMetafields,
        value: IdentifierCategoryKey.ShopifyCustomerMetafields,
    },
    {
        label: IdentifierCategoryValue.ShopifyLastOrderMetafields,
        value: IdentifierCategoryKey.ShopifyLastOrderMetafields,
    },
    {
        label: IdentifierCategoryValue.ShopifyLastDraftOrderMetafields,
        value: IdentifierCategoryKey.ShopifyLastDraftOrderMetafields,
    },
    {
        label: IdentifierCategoryValue.BigCommerceLastOrder,
        value: IdentifierCategoryKey.BigCommerceLastOrder,
    },
    {
        label: IdentifierCategoryValue.BigCommerceCustomer,
        value: IdentifierCategoryKey.BigCommerceCustomer,
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
    {
        label: IdentifierCategoryValue.SelfServiceFlow,
        value: IdentifierCategoryKey.SelfServiceFlow,
    },
    {
        label: IdentifierCategoryValue.InstagramProfile,
        value: IdentifierCategoryKey.InstagramProfile,
    },
]

export const IDENTIFIER_VARIABLES_BY_CATEGORY: {
    [key in IdentifierCategoryKey]: (
        | (IdentifierElement & { children?: undefined })
        | {
              label: IdentifierSubCategoryValue
              children: IdentifierElement[]
              value?: undefined
          }
    )[]
} = {
    [IdentifierCategoryKey.Message]: [
        {
            label: 'Body',
            text: 'message body',
            value: 'message.text',
        },
        {
            label: 'Channel',
            text: 'message channel',
            value: 'message.channel',
        },
        {
            label: 'Created date',
            text: 'message created date',
            value: 'message.created_datetime',
        },
        {
            label: 'From agent',
            text: 'message from agent',
            value: 'message.from_agent',
        },
        {
            label: 'Integration',
            text: 'message integration',
            value: 'message.integration_id',
        },
        {
            label: 'Intents',
            text: (
                <>
                    <i className="material-icons">auto_awesome</i> message
                    intents
                </>
            ),
            value: 'message.intents.name',
        },
        {
            label: 'Public',
            text: 'message public',
            value: 'message.public',
        },
        {
            label: 'Sent date',
            text: 'sent date of message',
            value: 'message.sent_datetime',
        },
        {
            label: 'Sentiments',
            text: (
                <>
                    <i className="material-icons">auto_awesome</i> message
                    sentiments
                </>
            ),
            value: 'message.sentiments.name',
        },
        {
            label: 'Via',
            text: 'message via',
            value: 'message.via',
        },
        {
            label: IdentifierSubCategoryValue.Receiver,
            children: [
                {
                    label: 'Receiver email',
                    text: 'message receiver email',
                    value: 'message.receiver.email',
                },
            ],
        },
        {
            label: IdentifierSubCategoryValue.Sender,
            children: [
                {
                    label: 'Sender email',
                    text: 'message sender email',
                    value: 'message.sender.email',
                },
            ],
        },
        {
            label: IdentifierSubCategoryValue.Source,
            children: [
                {
                    label: 'From address',
                    text: 'message source from address',
                    value: 'message.source.from.address',
                },
                {
                    label: 'From name',
                    text: 'message source from name',
                    value: 'message.source.from.name',
                },
            ],
        },
    ],
    [IdentifierCategoryKey.Ticket]: [
        {
            label: 'Assignee user',
            text: 'ticket assignee user',
            value: 'ticket.assignee_user_id',
        },
        {
            label: 'Assignee team',
            text: 'ticket assignee team',
            value: 'ticket.assignee_team_id',
        },
        {
            label: 'Assignee user email',
            text: 'ticket assignee user email',
            value: 'ticket.assignee_user.email',
        },
        {
            label: 'Channel',
            text: 'ticket channel',
            value: 'ticket.channel',
        },
        {
            label: 'Created date',
            text: 'created date of ticket',
            value: 'ticket.created_datetime',
        },
        {
            label: 'From agent',
            text: 'ticket from agent',
            value: 'ticket.from_agent',
        },
        {
            label: 'Language',
            text: 'ticket language',
            value: 'ticket.language',
        },
        {
            label: 'Last message date',
            text: 'date of last message in ticket',
            value: 'ticket.last_message_datetime',
        },
        {
            label: 'Last received message date',
            text: 'date of last received message in ticket',
            value: 'ticket.last_received_message_datetime',
        },
        {
            label: 'Priority',
            text: 'ticket priority',
            value: 'ticket.priority',
        },
        {
            label: 'Reopened date',
            text: 'ticket reopened date',
            value: 'ticket.opened_datetime',
        },
        {
            label: 'Satisfaction survey score',
            text: 'satisfaction survey score',
            value: 'ticket.satisfaction_survey.score',
        },
        {
            label: 'Spam',
            text: 'ticket spam',
            value: 'ticket.spam',
        },
        {
            label: 'Status',
            text: 'ticket status',
            value: 'ticket.status',
        },
        {
            label: 'Subject',
            text: 'ticket subject',
            value: 'ticket.subject',
        },
        {
            label: 'Tags',
            text: 'ticket tags',
            value: 'ticket.tags.name',
        },
        {
            label: 'Ticket fields',
            text: 'ticket fields',
            value: CustomFieldTreePath.Ticket,
        },
        {
            label: 'Unsnooze date',
            text: 'ticket unsnooze date',
            value: 'ticket.snooze_datetime',
        },
        {
            label: 'Via',
            text: 'ticket via',
            value: 'ticket.via',
        },
    ],
    [IdentifierCategoryKey.Customer]: [
        {
            label: 'Data',
            text: 'customer data',
            value: 'ticket.customer.data',
        },
        {
            label: 'Customer fields',
            text: 'customer fields',
            value: CustomFieldTreePath.Customer,
        },
        {
            label: 'Email',
            text: 'customer email',
            value: 'ticket.customer.email',
        },
        {
            label: 'Other integrations',
            text: 'customer other integrations',
            value: 'ticket.customer.integrations.other',
        },
    ],
    [IdentifierCategoryKey.ShopifyLastOrder]: [
        {
            label: 'Created date',
            text: 'date of last order',
            value: 'ticket.customer.integrations.shopify.last_order.created_at',
        },
        {
            label: 'Financial status',
            text: 'last order financial status',
            value: 'ticket.customer.integrations.shopify.last_order.financial_status',
        },
        {
            label: 'Fulfillment status',
            text: 'last order fulfillment status',
            value: 'ticket.customer.integrations.shopify.last_order.fulfillment_status',
        },
        {
            label: 'Tags',
            text: 'last order tags',
            value: 'ticket.customer.integrations.shopify.last_order.tags',
        },
        {
            label: 'Total price',
            text: 'total price of last order',
            value: 'ticket.customer.integrations.shopify.last_order.total_price',
        },
        {
            label: IdentifierSubCategoryValue.LastFulfillment,
            children: [
                {
                    label: 'Created date',
                    text: 'shipping date of last order',
                    value: 'ticket.customer.integrations.shopify.last_order.last_fulfillment.created_at',
                },
                {
                    label: 'Shipment status',
                    text: 'last order shipment status',
                    value: 'ticket.customer.integrations.shopify.last_order.last_fulfillment.shipment_status',
                },
                {
                    label: 'Status',
                    text: 'last fulfillment status',
                    value: 'ticket.customer.integrations.shopify.last_order.last_fulfillment.status',
                },
                {
                    label: 'Tracking number',
                    text: 'last order tracking number',
                    value: 'ticket.customer.integrations.shopify.last_order.last_fulfillment.tracking_number',
                },
            ],
        },
        {
            label: IdentifierSubCategoryValue.ShippingAddress,
            children: [
                {
                    label: 'Country',
                    text: 'destination country of last order',
                    value: 'ticket.customer.integrations.shopify.last_order.shipping_address.country',
                },
                {
                    label: 'Province',
                    text: 'destination province of last order',
                    value: 'ticket.customer.integrations.shopify.last_order.shipping_address.province',
                },
            ],
        },
    ],
    [IdentifierCategoryKey.ShopifyCustomer]: [
        {
            label: 'Created date',
            text: 'customer created date',
            value: 'ticket.customer.integrations.shopify.customer.created_at',
        },
        {
            label: 'Orders count',
            text: 'customer order count',
            value: 'ticket.customer.integrations.shopify.customer.orders_count',
        },
        {
            label: 'Tags',
            text: 'customer tags',
            value: 'ticket.customer.integrations.shopify.customer.tags',
        },
        {
            label: 'Total spent',
            text: 'customer total spent',
            value: 'ticket.customer.integrations.shopify.customer.total_spent',
        },
    ],
    [IdentifierCategoryKey.ShopifyCustomerMetafields]: [],
    [IdentifierCategoryKey.ShopifyLastOrderMetafields]: [],
    [IdentifierCategoryKey.ShopifyLastDraftOrderMetafields]: [],
    [IdentifierCategoryKey.BigCommerceLastOrder]: [
        {
            label: 'Created date',
            text: 'date of last order',
            value: 'ticket.customer.integrations.bigcommerce.last_order.date_created',
        },
        {
            label: 'Status',
            text: 'last order status',
            value: 'ticket.customer.integrations.bigcommerce.last_order.status',
        },
        {
            label: 'Total price',
            text: 'total price of last order',
            value: 'ticket.customer.integrations.bigcommerce.last_order.total_inc_tax',
        },
        {
            label: 'Shipping date',
            text: 'shipping date of last order',
            value: 'ticket.customer.integrations.bigcommerce.last_order.date_shipped',
        },
        {
            label: IdentifierSubCategoryValue.LastOrderShipments,
            children: [
                {
                    label: 'Tracking number',
                    text: 'last order tracking number',
                    value: 'ticket.customer.integrations.bigcommerce.last_order.last_order_shipments.tracking_number',
                },
            ],
        },
        {
            label: IdentifierSubCategoryValue.LastShipping,
            children: [
                {
                    label: 'Country',
                    text: 'destination country of last order',
                    value: 'ticket.customer.integrations.bigcommerce.last_order.last_shipping.country',
                },
                {
                    label: 'State',
                    text: 'destination state of last order',
                    value: 'ticket.customer.integrations.bigcommerce.last_order.last_shipping.state',
                },
                {
                    label: 'City',
                    text: 'destination city of last order',
                    value: 'ticket.customer.integrations.bigcommerce.last_order.last_shipping.city',
                },
            ],
        },
    ],
    [IdentifierCategoryKey.BigCommerceCustomer]: [
        {
            label: 'Created date',
            text: 'customer created date',
            value: 'ticket.customer.integrations.bigcommerce.customer.date_created',
        },
    ],
    [IdentifierCategoryKey.Magento2LastOrder]: [
        {
            label: 'Date of last order',
            text: 'date of last order',
            value: 'ticket.customer.integrations.magento2.last_order.created_at',
        },
        {
            label: 'Grand total',
            text: 'last order grand total',
            value: 'ticket.customer.integrations.magento2.last_order.grand_total',
        },
        {
            label: 'Created date',
            text: 'shipping date of last order',
            value: 'ticket.customer.integrations.magento2.last_order.last_shipment.created_at',
        },
        {
            label: 'State',
            text: 'last order state',
            value: 'ticket.customer.integrations.magento2.last_order.state',
        },
    ],
    [IdentifierCategoryKey.Magento2Customer]: [
        {
            label: 'Created date',
            text: 'created date of customer',
            value: 'ticket.customer.integrations.magento2.customer.created_at',
        },
    ],
    [IdentifierCategoryKey.RechargeLastSubscription]: [
        {
            label: 'Created date',
            text: 'created date of last subscription',
            value: 'ticket.customer.integrations.recharge.last_subscription.created_at',
        },
        {
            label: 'Date of next scheduled charge',
            text: 'next scheduled charge date of last subscription',
            value: 'ticket.customer.integrations.recharge.last_subscription.next_charge_scheduled_at',
        },
        {
            label: 'Product title',
            text: 'last subscription product title',
            value: 'ticket.customer.integrations.recharge.last_subscription.product_title',
        },
    ],
    [IdentifierCategoryKey.RechargeCustomer]: [
        {
            label: 'Status',
            text: 'customer status',
            value: 'ticket.customer.integrations.recharge.customer.status',
        },
    ],
    [IdentifierCategoryKey.SmileCustomer]: [
        {
            label: 'Point balance',
            text: 'customer point balance',
            value: 'ticket.customer.integrations.smile.customer.point_balance',
        },
        {
            label: 'State',
            text: 'customer state',
            value: 'ticket.customer.integrations.smile.customer.state',
        },
        {
            label: 'Vip tier',
            text: 'customer vip tier',
            value: 'ticket.customer.integrations.smile.customer.vip_tier.name',
        },
    ],
    [IdentifierCategoryKey.SelfServiceFlow]: [
        {
            label: ORDER_MANAGEMENT,
            text: ORDER_MANAGEMENT.toLowerCase(),
            value: 'message.self_service_flow.order_management_flow',
        },
        {
            label: 'Self-service store',
            text: 'self-service store',
            value: 'message.self_service_flow.store_integration_id',
        },
    ],
    [IdentifierCategoryKey.InstagramProfile]: [
        {
            label: 'Business follows customer',
            text: 'business follows customer',
            value: 'ticket.customer.integrations.facebook.instagram.profile.business_follows_customer',
        },
        {
            label: 'Customer follows business',
            text: 'customer follows business',
            value: 'ticket.customer.integrations.facebook.instagram.profile.customer_follows_business',
        },
        {
            label: 'Followers count',
            text: 'followers count',
            value: 'ticket.customer.integrations.facebook.instagram.profile.total_followers',
        },
        {
            label: 'Username',
            text: 'username',
            value: 'ticket.customer.integrations.facebook.instagram.profile.username',
        },
        {
            label: 'Verified',
            text: 'verified',
            value: 'ticket.customer.integrations.facebook.instagram.profile.is_verified',
        },
    ],
}
