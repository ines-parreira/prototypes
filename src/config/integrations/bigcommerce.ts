import { Map } from 'immutable'

import { getTrackingLink } from 'common/tracking'
import { DATE_VARIABLE_TOOLTIP_TEXT } from 'config/integrations/constants'
import {
    DateAndTimeFormatting,
    DateTimeFormatMapper,
    DateTimeFormatType,
} from 'constants/datetime'
import { IntegrationType } from 'models/integration/types'
import { momentToLDMLFormat } from 'pages/common/utils/template'
import { getDateAndTimeFormatter } from 'state/currentUser/selectors'
import { StoreState } from 'state/types'
import { formatDatetime } from 'utils'

function getLastOrderTrackingURL(
    context: Map<any, any>,
    integrationId: number,
) {
    const lastOrderShipments = context.getIn([
        'ticket',
        'customer',
        'integrations',
        integrationId,
        'orders',
        0,
        'bc_order_shipments',
        0,
    ]) as Map<any, any>

    if (!lastOrderShipments) {
        return ''
    }

    const trackingLink: string | null = lastOrderShipments.get('tracking_link')
    const trackingNumber = lastOrderShipments.get('tracking_number')
    const shippingProvider = lastOrderShipments.get('shipping_provider')

    if (!trackingLink && trackingNumber && shippingProvider) {
        return getTrackingLink(trackingNumber, shippingProvider)
    }

    return trackingLink
}

export const MACRO_VARIABLES = {
    type: IntegrationType.BigCommerce,
    name: 'BigCommerce',
    integration: true,
    children: [
        {
            name: 'Number of last order',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].id}}',
        },
        {
            name: 'Date of last order',
            value: `{{ticket.customer.integrations.bigcommerce.orders[0].date_created|datetime_format("${momentToLDMLFormat(
                DateTimeFormatMapper[
                    DateTimeFormatType.LONG_DATE_WITH_YEAR_EN_US
                ].toString(),
            )}")}}`,
            tooltip: DATE_VARIABLE_TOOLTIP_TEXT,
            replace: (
                context: Map<any, any>,
                integrationId: number,
                currentUser: Map<any, any>,
            ) => {
                const lastOrder = context.getIn([
                    'ticket',
                    'customer',
                    'integrations',
                    integrationId,
                    'orders',
                    0,
                ]) as Map<any, any>

                if (!lastOrder || !lastOrder.get('date_created')) {
                    return ''
                }

                return formatDatetime(
                    lastOrder.get('date_created'),
                    getDateAndTimeFormatter({
                        currentUser: currentUser,
                    } as unknown as StoreState)(
                        DateAndTimeFormatting.LongDateWithYear,
                    ),
                )
            },
        },
        {
            name: 'Tracking url of last order',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].bc_order_shipments[0].tracking_link}}',
            replace: getLastOrderTrackingURL,
        },
        {
            name: 'Tracking number of last order',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].bc_order_shipments[0].tracking_number}}',
        },
        {
            name: 'Status of last order',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].status}}',
        },
        {
            name: 'Shipping date of last order',
            value: `{{ticket.customer.integrations.bigcommerce.orders[0].date_shipped|datetime_format("${momentToLDMLFormat(
                DateTimeFormatMapper[
                    DateTimeFormatType.LONG_DATE_WITH_YEAR_EN_US
                ].toString(),
            )}")}}`,
            tooltip: DATE_VARIABLE_TOOLTIP_TEXT,
            replace: (
                context: Map<any, any>,
                integrationId: number,
                currentUser: Map<any, any>,
            ) => {
                const lastOrder = context.getIn([
                    'ticket',
                    'customer',
                    'integrations',
                    integrationId,
                    'orders',
                    0,
                ]) as Map<any, any>

                if (!lastOrder || !lastOrder.get('date_shipped')) {
                    return ''
                }

                return formatDatetime(
                    lastOrder.get('date_shipped'),
                    getDateAndTimeFormatter({
                        currentUser: currentUser,
                    } as unknown as StoreState)(
                        DateAndTimeFormatting.LongDateWithYear,
                    ),
                )
            },
        },
        {
            name: 'Destination country of last order',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].bc_shipping[0].country}}',
        },
        {
            name: 'Shipping address of last order',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].bc_shipping[0].street_1}} {{ticket.customer.integrations.bigcommerce.orders[0].bc_shipping[0].street_2}}, {{ticket.customer.integrations.bigcommerce.orders[0].bc_shipping[0].zip}} {{ticket.customer.integrations.bigcommerce.orders[0].bc_shipping[0].city}} {{ticket.customer.integrations.bigcommerce.orders[0].bc_shipping[0].state}}',
        },
    ],
}

export const MACRO_HIDDEN_VARIABLES = {
    type: IntegrationType.BigCommerce,
    name: 'BigCommerce',
    integration: true,
    children: [
        {
            name: 'Street 1',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].bc_shipping[0].street_1}}',
        },
        {
            name: 'Street 2',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].bc_shipping[0].street_2}}',
        },
        {
            name: 'Zip code',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].bc_shipping[0].zip}}',
        },
        {
            name: 'City',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].bc_shipping[0].city}}',
        },
        {
            name: 'State',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].bc_shipping[0].state}}',
        },
    ],
}

export const MACRO_PREVIOUS_VARIABLES = {
    type: IntegrationType.BigCommerce,
    name: 'BigCommerce',
    integration: true,
    children: [
        {
            name: 'Date of last order',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].date_created|datetime_format("MMMM d YYYY")}}',
        },
        {
            name: 'Shipping date of last order',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].date_shipped|datetime_format("MMMM d YYYY")}}',
        },
    ],
}
