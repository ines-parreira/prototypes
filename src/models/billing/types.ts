import {AccountFeatures} from '../../state/currentAccount/types'

export enum PlanInterval {
    'Month' = 'month',
}

export type Plan = {
    id: string
    cost_per_ticket: number
    interval: PlanInterval
    public: boolean
    name: string
    trial_period_days: number
    order: number
    currency: string
    free_tickets: number
    limits: {
        default: number
        max: number
        min: number
    }
    amount: number
    integrations: number
    features: Record<
        string,
        typeof AccountFeatures[keyof typeof AccountFeatures]
    >
}
