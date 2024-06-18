import {Plan, ProductType, HelpdeskPlan} from 'models/billing/types'

export type SubscriptionProducts = {
    [key in ProductType]: Plan | null
} & {
    [ProductType.Helpdesk]: HelpdeskPlan
}
