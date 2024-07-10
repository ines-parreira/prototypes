import {IntegrationType} from '@gorgias/api-types'
import {Map} from 'immutable'

import {PartialTemplate} from 'models/widget/types'
import {
    CUSTOM_WIDGET_TYPE,
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    STANDALONE_WIDGET_TYPE,
    WOOCOMMERCE_WIDGET_TYPE,
} from 'state/widgets/constants'

export enum WidgetEnvironment {
    Ticket = 'ticket',
    Customer = 'customer',
    User = 'user',
}

export type WidgetType =
    | typeof IntegrationType.Shopify
    | typeof IntegrationType.Recharge
    | typeof IntegrationType.Smile
    | typeof IntegrationType.Magento2
    | typeof IntegrationType.Http
    | typeof IntegrationType.Yotpo
    | typeof IntegrationType.Bigcommerce
    | typeof IntegrationType.Klaviyo
    | typeof CUSTOM_WIDGET_TYPE
    | typeof CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE
    | typeof STANDALONE_WIDGET_TYPE
    | typeof WOOCOMMERCE_WIDGET_TYPE

export type Widget = {
    order: number
    type: WidgetType
    context: WidgetEnvironment
    template: PartialTemplate
    created_datetime: string
    deactivated_datetime: string | null
    id: number
    integration_id: number | null
    app_id?: string | null
    updated_datetime: string | null
    uri: string
}

export type WidgetsState = Map<any, any>
