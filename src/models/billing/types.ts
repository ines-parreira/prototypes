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

export type Plan = HelpdeskPlan | AutomatePlan | SMSOrVoicePlan | ConvertPlan

export type Product<T = Plan> = {
    id: string
    type: T extends HelpdeskPlan
        ? ProductType.Helpdesk
        : T extends AutomatePlan
        ? ProductType.Automation
        : T extends SMSOrVoicePlan
        ? ProductType.Voice | ProductType.SMS
        : T extends ConvertPlan
        ? ProductType.Convert
        : never
    prices: T[]
}

type BasePlan = {
    product: ProductType
    num_quota_tickets: number | null // Integers only, is None for the legacy Automate usd-4 plans
    amount: number
    currency: string
    custom: boolean
    extra_ticket_cost: number
    internal_id: string
    interval: PlanInterval
    cadence: PlanInterval
    name: string
    product_id: string
    price_id: string
    public: boolean
}

export type HelpdeskPriceFeatures = Record<
    AccountFeature,
    AccountFeatureMetadata
>

export type HelpdeskPlan = BasePlan & {
    num_quota_tickets: number
    addons?: string[]
    integrations: number
    is_legacy: boolean
    legacy_id: string
    order?: number
    features: HelpdeskPriceFeatures
    legacy_automation_addon_features?: AutomatePriceFeatures
    limits: {
        messages: PlanLimits
        tickets: PlanLimits
    }
    phone_limits: {
        billing: number
    }
    trial_period_days: number
}

export type AutomatePriceFeatures = Record<
    | AccountFeature.AutomationTrackOrderFlow
    | AccountFeature.AutomationReportIssueFlow
    | AccountFeature.AutomationCancellationsFlow
    | AccountFeature.AutomationReturnFlow
    | AccountFeature.AutomationSelfServiceStatistics
    | AccountFeature.AutomationManagedRules,
    AccountFeatureMetadata
>

export type AutomatePlan = BasePlan & {
    automation_addon_discount: number
    automation_addon_included?: boolean
    base_price_id: string
    features: AutomatePriceFeatures
    legacy_id: string
    order: number
    num_quota_tickets: number | null
}

export type SMSOrVoicePlan = BasePlan & {
    num_quota_tickets: number
}

export type ConvertPlan = BasePlan & {
    num_quota_tickets: number | null
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

export type CouponSummary = {
    name: string
    duration: string
    duration_in_months: number | null
    amount_off_in_cents: number | null
    amount_off_decimal: string | null
    percent_off: number | null
}

type ProductUsage = {
    num_tickets: number
    num_extra_tickets: number
    extra_tickets_cost_in_cents: number
}

export type ProductUsages = {
    helpdesk: ProductUsage
    automation: ProductUsage | null
    sms: ProductUsage | null
    voice: ProductUsage | null
    convert: ProductUsage | null
}

export type UpcomingInvoiceSummary = {
    coupon: CouponSummary | null
    // subtotal : coupon is NOT taken into account
    subtotal_in_cents: number
    subtotal_decimal: string
    // total : coupon is taken into account
    total_in_cents: number
    total_decimal: string
    usages: ProductUsages
}

type SubscriptionSummary = {
    status: string
    cadence: PlanInterval
    is_trialing: boolean
    trial_start_datetime: string | null
    trial_end_datetime: string | null
    has_schedule: boolean
    downgrade_scheduled: boolean
    // downgrades: list[ScheduledPriceChange]
    scheduled_to_cancel_at: string | null
    current_billing_cycle_start_datetime: string
    current_billing_cycle_end_datetime: string
    coupon: CouponSummary | null
}

export type BillingState = {
    upcoming_invoice: UpcomingInvoiceSummary | null
    subscription: SubscriptionSummary | null
}

export type CouponForSales = string[]
