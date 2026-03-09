import type { TicketThreadActionExecutedEventItem } from '../../../../../hooks/events/types'

export type ActionExecutedEventData =
    TicketThreadActionExecutedEventItem['data']['data']
export type ActionExecutedPayload = ActionExecutedEventData['payload']
export type ActionExecutedActionName = ActionExecutedEventData['action_name']

export type ActionExecutedSourceFamily =
    | 'shopify'
    | 'bigcommerce'
    | 'recharge'
    | 'custom-http'

export type ActionExecutedOrderToken = {
    label: string
    href?: string
}

export type ActionExecutedDetailsEntry = {
    key: string
    value: string
}
