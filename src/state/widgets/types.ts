import {Map} from 'immutable'
import {IntegrationType} from 'models/integration/types'
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
    | IntegrationType
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
    deactivated_datetime: Maybe<string>
    id: number
    integration_id: Maybe<number>
    app_id: Maybe<string>
    updated_datetime: Maybe<string>
    uri: string
}

export type WidgetsState = Map<any, any>
