import { HelpdeskPlan, Plan, ProductType } from 'models/billing/types'

export type SubscriptionProducts = {
    [key in ProductType]: Plan | null
} & {
    [ProductType.Helpdesk]: HelpdeskPlan
}
