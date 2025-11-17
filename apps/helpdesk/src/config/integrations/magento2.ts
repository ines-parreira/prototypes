import type { List, Map } from 'immutable'

import { DATE_VARIABLE_TOOLTIP_TEXT } from 'config/integrations/constants'
import {
    DateAndTimeFormatting,
    DateTimeFormatMapper,
    DateTimeFormatType,
} from 'constants/datetime'
import { IntegrationType } from 'models/integration/types'
import { momentToLDMLFormat } from 'pages/common/utils/template'
import { getDateAndTimeFormatter } from 'state/currentUser/selectors'
import type { StoreState } from 'state/types'
import { formatDatetime } from 'utils'
import { getTrackingUrl } from 'utils/delivery'

export const MACRO_VARIABLES = {
    type: IntegrationType.Magento2,
    name: 'Magento 2',
    integration: true,
    children: [
        {
            name: 'Number of last order',
            value: '{{ticket.customer.integrations.magento2.orders[0].increment_id}}',
        },
        {
            name: 'Date of last order',
            value: `{{ticket.customer.integrations.magento2.orders[0].created_at|datetime_format("${momentToLDMLFormat(
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

                if (!lastOrder || !lastOrder.get('created_at')) {
                    return ''
                }

                return formatDatetime(
                    lastOrder.get('created_at'),
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
            value: '{{ticket.customer.integrations.magento2.orders[0].last_shipment.last_track.tracking_url}}',
            replace: (context: Map<any, any>, integrationId: number) => {
                const lastOrder = context.getIn([
                    'ticket',
                    'customer',
                    'integrations',
                    integrationId,
                    'orders',
                    0,
                ]) as Map<any, any>
                const shipments = context.getIn([
                    'ticket',
                    'customer',
                    'integrations',
                    integrationId,
                    'shipments',
                ]) as List<any>
                if (!lastOrder || !shipments) {
                    return ''
                }

                const lastOrderLastShipment = shipments
                    .filter(
                        (shipment: Map<any, any>) =>
                            shipment.get('order_id') ===
                            lastOrder.get('entity_id'),
                    )
                    .first() as Map<any, any>

                if (!lastOrderLastShipment || lastOrderLastShipment.isEmpty()) {
                    return ''
                }

                const lastTrack = lastOrderLastShipment.getIn([
                    'tracks',
                    0,
                ]) as Map<any, any>
                if (!lastTrack) {
                    return ''
                }

                const trackNumber = lastTrack.get('track_number')
                const carrierCode = lastTrack.get('carrier_code')
                return getTrackingUrl(trackNumber, carrierCode)
            },
        },
        {
            name: 'Tracking number of last order',
            value: '{{ticket.customer.integrations.magento2.orders[0].last_shipment.last_track.track_number}}',
            replace: (context: Map<any, any>, integrationId: number) => {
                const lastOrder = context.getIn([
                    'ticket',
                    'customer',
                    'integrations',
                    integrationId,
                    'orders',
                    0,
                ]) as Map<any, any>
                const shipments = context.getIn([
                    'ticket',
                    'customer',
                    'integrations',
                    integrationId,
                    'shipments',
                ]) as List<any>
                if (!lastOrder || !shipments) {
                    return ''
                }

                const lastOrderLastShipment = shipments
                    .filter(
                        (shipment: Map<any, any>) =>
                            shipment.get('order_id') ===
                            lastOrder.get('entity_id'),
                    )
                    .first() as Map<any, any>

                if (!lastOrderLastShipment || lastOrderLastShipment.isEmpty()) {
                    return ''
                }

                const lastTrack = lastOrderLastShipment.getIn([
                    'tracks',
                    0,
                ]) as Map<any, any>
                if (!lastTrack) {
                    return ''
                }

                return lastTrack.get('track_number') as string
            },
        },
        {
            name: 'Shipping date of last order',
            value: `{{ticket.customer.integrations.magento2.orders[0].last_shipment.last_track.created_at|datetime_format("${momentToLDMLFormat(
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
                const shipments = context.getIn([
                    'ticket',
                    'customer',
                    'integrations',
                    integrationId,
                    'shipments',
                ]) as List<any>
                if (!lastOrder || !shipments) {
                    return ''
                }

                const lastOrderLastShipment = shipments
                    .filter(
                        (shipment: Map<any, any>) =>
                            shipment.get('order_id') ===
                            lastOrder.get('entity_id'),
                    )
                    .first() as Map<any, any>

                if (!lastOrderLastShipment || lastOrderLastShipment.isEmpty()) {
                    return ''
                }

                const lastTrack = lastOrderLastShipment.getIn([
                    'tracks',
                    0,
                ]) as Map<any, any>
                if (!lastTrack || !lastTrack.get('created_at')) {
                    return ''
                }

                return formatDatetime(
                    lastTrack.get('created_at'),
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
            value: '{{ticket.customer.integrations.magento2.orders[0].extension_attributes.shipping_assignments[0].shipping.address.country_id}}',
        },
        {
            name: 'Shipping address of last order',
            value: '{{ticket.customer.integrations.magento2.orders[0].extension_attributes.shipping_assignments[0].shipping.address.street[0]}}, {{ticket.customer.integrations.magento2.orders[0].extension_attributes.shipping_assignments[0].shipping.address.postcode}} {{ticket.customer.integrations.magento2.orders[0].extension_attributes.shipping_assignments[0].shipping.address.city}} {{ticket.customer.integrations.magento2.orders[0].extension_attributes.shipping_assignments[0].shipping.address.region_code}}',
        },
    ],
}

export const MACRO_HIDDEN_VARIABLES = {
    type: IntegrationType.Magento2,
    name: 'Magento 2',
    integration: true,
    children: [
        {
            name: 'Street',
            value: '{{ticket.customer.integrations.magento2.orders[0].extension_attributes.shipping_assignments[0].shipping.address.street[0]}}',
        },
        {
            name: 'City',
            value: '{{ticket.customer.integrations.magento2.orders[0].extension_attributes.shipping_assignments[0].shipping.address.city}}',
        },
        {
            name: 'Postcode',
            value: '{{ticket.customer.integrations.magento2.orders[0].extension_attributes.shipping_assignments[0].shipping.address.postcode}}',
        },
        {
            name: 'Region code',
            value: '{{ticket.customer.integrations.magento2.orders[0].extension_attributes.shipping_assignments[0].shipping.address.region_code}}',
        },
    ],
}

export const MACRO_PREVIOUS_VARIABLES = {
    type: IntegrationType.Magento2,
    name: 'Magento 2',
    integration: true,
    children: [
        {
            name: 'Date of last order',
            value: '{{ticket.customer.integrations.magento2.orders[0].created_at|datetime_format("MMMM d YYYY")}}',
        },
        {
            name: 'Shipping date of last order',
            value: '{{ticket.customer.integrations.magento2.orders[0].last_shipment.last_track.created_at}}',
            replace: (context: Map<any, any>, integrationId: number) => {
                const lastOrder = context.getIn([
                    'ticket',
                    'customer',
                    'integrations',
                    integrationId,
                    'orders',
                    0,
                ]) as Map<any, any>
                const shipments = context.getIn([
                    'ticket',
                    'customer',
                    'integrations',
                    integrationId,
                    'shipments',
                ]) as List<any>
                if (!lastOrder || !shipments) {
                    return ''
                }

                const lastOrderLastShipment = shipments
                    .filter(
                        (shipment: Map<any, any>) =>
                            shipment.get('order_id') ===
                            lastOrder.get('entity_id'),
                    )
                    .first() as Map<any, any>

                if (!lastOrderLastShipment || lastOrderLastShipment.isEmpty()) {
                    return ''
                }

                const lastTrack = lastOrderLastShipment.getIn([
                    'tracks',
                    0,
                ]) as Map<any, any>
                if (!lastTrack) {
                    return ''
                }

                return formatDatetime(
                    lastTrack.get('created_at'),
                    DateTimeFormatMapper[
                        DateTimeFormatType.LONG_DATE_WITH_YEAR_EN_US
                    ],
                    null,
                )
            },
        },
    ],
}
