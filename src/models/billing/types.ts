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
    Voice = 'voice',
    SMS = 'sms',
    Convert = 'convert',
}

// A Stripe price ID always starts with 'price_'.
export type PriceId = string
// A Stripe product ID always starts with 'prod_'.
export type ProductId = string

export type Price =
    | HelpdeskPrice
    | AutomationPrice
    | SMSOrVoicePrice
    | ConvertPrice

export type Product<T = Price> = {
    id: string
    type: T extends HelpdeskPrice
        ? ProductType.Helpdesk
        : T extends AutomationPrice
        ? ProductType.Automation
        : T extends SMSOrVoicePrice
        ? ProductType.Voice | ProductType.SMS
        : T extends ConvertPrice
        ? ProductType.Convert
        : never
    prices: T[]
}

type BasePrice = {
    product: ProductType
    num_quota_tickets: number | null // Integers only, is None for the legacy Automate usd-4 plans
    amount: number
    currency: string
    extra_ticket_cost: number
    internal_id: string
    interval: PlanInterval
    cadence: PlanInterval
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
    num_quota_tickets: number
    addons?: string[]
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
    num_quota_tickets: number | null
}

export type SMSOrVoicePrice = Omit<BasePrice, 'legacy_id' | 'order'> & {
    num_quota_tickets: number
}

export type ConvertPrice = Omit<BasePrice, 'legacy_id' | 'order'> & {
    num_quota_tickets: number | null
    custom?: boolean
    tier?: number
}

export type SubscriptionCycle = {
    current_billing_cycle_end_datetime: string
    current_billing_cycle_start_datetime: string
    downgrade_scheduled: boolean
    downgrades?: {
        current_price_id: string
        scheduled_price_id: string | null
    }[]
}

export type ChurnMitigationOfferDecisionEvent = {
    product_type: ProductType
    primary_reason: string
    secondary_reason: string | null
    other_reason: string | null
    accepted: boolean
}
