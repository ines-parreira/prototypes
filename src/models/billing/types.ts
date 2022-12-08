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

export enum ProductType {
    Helpdesk = 'helpdesk',
    Automation = 'automation',
}

export type Product<T = HelpdeskPrice | AutomationPrice> = {
    id: string
    type: T extends HelpdeskPrice
        ? ProductType.Helpdesk
        : T extends AutomationPrice
        ? ProductType.Automation
        : never
    prices: T[]
}

type BasePrice = {
    amount: number
    currency: string
    interval: PlanInterval
    legacy_id: string
    name: string
    order?: number
    product_id: string
    price_id: string
}

export type HelpdeskPriceFeatures = Record<
    AccountFeature,
    AccountFeatureMetadata
>

export type HelpdeskPrice = BasePrice & {
    addons?: string[]
    cost_per_ticket: number
    free_tickets: number
    integrations: number
    is_legacy: boolean
    features: HelpdeskPriceFeatures
    legacy_automation_addon_features?: AutomationPriceFeatures
    limits: {
        messages: PlanLimits
        tickets: PlanLimits
    }
    phone_limits: {
        billing: number
    }
    public: boolean
    custom?: boolean
    trial_period_days: number
}

export type AutomationPriceFeatures = Record<
    | AccountFeature.AutomationTrackOrderFlow
    | AccountFeature.AutomationReportIssueFlow
    | AccountFeature.AutomationCancellationsFlow
    | AccountFeature.AutomationReturnFlow
    | AccountFeature.AutomationSelfServiceStatistics
    | AccountFeature.AutomationManagedRules,
    AccountFeatureMetadata
>

export type AutomationPrice = BasePrice & {
    automation_addon_discount: number
    automation_addon_included?: boolean
    base_price_id: string
    features: AutomationPriceFeatures
    additional_cost_per_ticket: number
}
