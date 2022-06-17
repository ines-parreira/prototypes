import {Map} from 'immutable'

import {PartialTemplate} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/types'
import {IntegrationType} from '../../models/integration/types'

export enum WidgetContextType {
    Ticket = 'ticket',
    Customer = 'customer',
}

export type WidgetContext = WidgetContextType | string

export type Widget = {
    order: number
    type: IntegrationType | 'custom'
    context: WidgetContextType
    template: PartialTemplate
    created_datetime: string
    deactivated_datetime: Maybe<string>
    id: number
    integration_id: Maybe<number>
    updated_datetime: Maybe<string>
    uri: string
}

export type WidgetsState = Map<any, any>
