import {Price, ProductType, HelpdeskPrice} from 'models/billing/types'

export type SubscriptionProducts = {
    [key in ProductType]: Price | null
} & {
    [ProductType.Helpdesk]: HelpdeskPrice
}
