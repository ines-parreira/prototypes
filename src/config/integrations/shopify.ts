import {Map} from 'immutable'
import {formatDatetime} from 'utils'
import {StoreState} from 'state/types'
import {TicketChannel} from 'business/types/ticket'
import {IntegrationType} from 'models/integration/types'
import {
    DateAndTimeFormatting,
    DateTimeFormatMapper,
    DateTimeFormatType,
} from 'constants/datetime'
import {getDateAndTimeFormatter} from 'state/currentUser/selectors'
import {DATE_VARIABLE_TOOLTIP_TEXT} from 'config/integrations/constants'
import {momentToLDMLFormat} from 'pages/common/utils/template'

export const MACRO_VARIABLES = {
    type: IntegrationType.Shopify,
    name: 'Shopify',
    integration: true,
    children: [
        {
            name: 'Number of last order',
            value: '{{ticket.customer.integrations.shopify.orders[0].name}}',
        },
        {
            name: 'Date of last order',
            value: `{{ticket.customer.integrations.shopify.orders[0].created_at|datetime_format("${momentToLDMLFormat(
                DateTimeFormatMapper[
                    DateTimeFormatType.LONG_DATE_WITH_YEAR_EN_US
                ].toString()
            )}")}}`,
            tooltip: DATE_VARIABLE_TOOLTIP_TEXT,
            replace: (
                context: Map<any, any>,
                integrationId: number,
                currentUser: Map<any, any>
            ) => {
                const lastOrder = context.getIn([
                    'ticket',
                    'customer',
                    'integrations',
                    integrationId,
                    'orders',
                    0,
                ]) as Map<any, any>

                if (!lastOrder || !lastOrder.get('created_at')) {
                    return ''
                }

                return formatDatetime(
                    lastOrder.get('created_at'),
                    getDateAndTimeFormatter({
                        currentUser: currentUser,
                    } as unknown as StoreState)(
                        DateAndTimeFormatting.LongDateWithYear
                    )
                )
            },
        },
        {
            name: 'Tracking url of last order',
            value: '{{ticket.customer.integrations.shopify.orders[0].fulfillments[0].tracking_url}}',
        },
        {
            name: 'Tracking number of last order',
            value: '{{ticket.customer.integrations.shopify.orders[0].fulfillments[0].tracking_number}}',
        },
        {
            name: 'Delivery status of last order',
            value: '{{ticket.customer.integrations.shopify.orders[0].fulfillments[0].shipment_status}}',
        },
        {
            name: 'Status URL of last order',
            value: '{{ticket.customer.integrations.shopify.orders[0].order_status_url}}',
        },
        {
            name: 'Shipping date of last order',
            value: `{{ticket.customer.integrations.shopify.orders[0].fulfillments[0].created_at|datetime_format("${momentToLDMLFormat(
                DateTimeFormatMapper[
                    DateTimeFormatType.LONG_DATE_WITH_YEAR_EN_US
                ].toString()
            )}")}}`,
            tooltip: DATE_VARIABLE_TOOLTIP_TEXT,
            replace: (
                context: Map<any, any>,
                integrationId: number,
                currentUser: Map<any, any>
            ) => {
                const lastOrder = context.getIn([
                    'ticket',
                    'customer',
                    'integrations',
                    integrationId,
                    'orders',
                    0,
                ]) as Map<any, any>
                if (!lastOrder) {
                    return ''
                }

                const lastOrderFulfillment = lastOrder.getIn([
                    'fulfillments',
                    0,
                ]) as Map<any, any>
                if (
                    !lastOrderFulfillment ||
                    !lastOrderFulfillment.get('created_at')
                ) {
                    return ''
                }

                return formatDatetime(
                    lastOrderFulfillment.get('created_at'),
                    getDateAndTimeFormatter({
                        currentUser: currentUser,
                    } as unknown as StoreState)(
                        DateAndTimeFormatting.LongDateWithYear
                    )
                )
            },
        },
        {
            name: 'Destination country of last order',
            value: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.country}}',
        },
        {
            name: 'Shipping address of last order',
            value: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.address1}} {{ticket.customer.integrations.shopify.orders[0].shipping_address.address2}}, {{ticket.customer.integrations.shopify.orders[0].shipping_address.zip}} {{ticket.customer.integrations.shopify.orders[0].shipping_address.city}} {{ticket.customer.integrations.shopify.orders[0].shipping_address.province}}',
        },
    ],
}

export const MACRO_HIDDEN_VARIABLES = {
    type: IntegrationType.Shopify,
    name: 'Shopify',
    integration: true,
    children: [
        {
            name: 'Address 1',
            value: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.address1}}',
        },
        {
            name: 'Address 2',
            value: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.address2}}',
        },
        {
            name: 'Zip code',
            value: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.zip}}',
        },
        {
            name: 'City',
            value: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.city}}',
        },
        {
            name: 'Province',
            value: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.province}}',
        },
    ],
}

export const UNSUPPORTED_HYPERLINKS_CHANNELS_FOR_PRODUCT_LINKS = [
    TicketChannel.Facebook,
    TicketChannel.FacebookMention,
    TicketChannel.FacebookMessenger,
    TicketChannel.FacebookRecommendations,
    TicketChannel.InstagramAdComment,
    TicketChannel.InstagramComment,
    TicketChannel.InstagramMention,
    TicketChannel.InstagramDirectMessage,
]

export const UNSUPPORTED_HYPERLINKS_CHANNELS_FOR_DISCOUNT_CODES = [
    ...UNSUPPORTED_HYPERLINKS_CHANNELS_FOR_PRODUCT_LINKS,
    TicketChannel.Sms,
]

export const UNSUPPORTED_HYPERLINKS_CHANNELS_FOR_VIDEOS = [
    ...UNSUPPORTED_HYPERLINKS_CHANNELS_FOR_DISCOUNT_CODES,
]

export const MACRO_PREVIOUS_VARIABLES = {
    type: IntegrationType.Shopify,
    name: 'Shopify',
    integration: true,
    children: [
        {
            name: 'Number of last order',
            value: '{{ticket.customer.integrations.shopify.orders[0].order_number}}',
        },
        {
            name: 'Tracking urls of last order',
            value: '{{ticket.customer.integrations.shopify.orders[0].fulfillments[0].tracking_urls}}',
        },
        {
            name: 'Tracking numbers of last order',
            value: '{{ticket.customer.integrations.shopify.orders[0].fulfillments[0].tracking_numbers}}',
        },
        {
            name: 'Address 1',
            value: '{{ticket.customer.integrations.shopify.customer.default_address.address1}}',
        },
        {
            name: 'Address 2',
            value: '{{ticket.customer.integrations.shopify.customer.default_address.address2}}',
        },
        {
            name: 'Zip code',
            value: '{{ticket.customer.integrations.shopify.customer.default_address.zip}}',
        },
        {
            name: 'City',
            value: '{{ticket.customer.integrations.shopify.customer.default_address.city}}',
        },
        {
            name: 'Province',
            value: '{{ticket.customer.integrations.shopify.customer.default_address.province}}',
        },
        {
            name: 'Date of last order',
            value: '{{ticket.customer.integrations.shopify.orders[0].created_at|datetime_format("MMMM Do YYYY")}}',
        },
        {
            name: 'Shipping date of last order',
            value: '{{ticket.customer.integrations.shopify.orders[0].fulfillments[0].created_at|datetime_format("MMMM Do YYYY")}}',
        },
        {
            name: 'Date of last order',
            value: '{{ticket.customer.integrations.shopify.orders[0].created_at|datetime_format("MMMM d YYYY")}}',
        },
        {
            name: 'Shipping date of last order',
            value: '{{ticket.customer.integrations.shopify.orders[0].fulfillments[0].created_at|datetime_format("MMMM d YYYY")}}',
        },
    ],
}
