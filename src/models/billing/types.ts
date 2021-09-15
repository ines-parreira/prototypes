import {
    AccountFeature,
    AccountFeatureMetadata,
} from '../../state/currentAccount/types'

export enum PlanInterval {
    Month = 'month',
    Year = 'year',
}

export type PlanLimits = {
    default: number
    max: number
    min: number
}

export type Plan = {
    id: string
    cost_per_ticket: number
    interval: PlanInterval
    public: boolean
    custom?: boolean
    name: string
    trial_period_days: number
    order: number
    currency: string
    free_tickets: number
    limits: {
        messages: PlanLimits
        tickets: PlanLimits
    }
    amount: number
    integrations: number
    automation_addon_included?: boolean
    automation_addon_amount?: number
    features: Record<AccountFeature, AccountFeatureMetadata>
    features_prior_2021_09_20?: Record<AccountFeature, AccountFeatureMetadata>
    legacy_features?: Record<AccountFeature, AccountFeatureMetadata>
}
