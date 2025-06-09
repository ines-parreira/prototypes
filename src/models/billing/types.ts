import {
    AccountFeature,
    AccountFeatureMetadata,
} from 'state/currentAccount/types'

export enum Cadence {
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

// A PlanId is billing-provider agnostic.
export type PlanId = string

// A Stripe price ID always starts with 'price_'.
export type PriceId = string
// A Stripe product ID always starts with 'prod_'.
export type ProductId = string

export type Plan = HelpdeskPlan | AutomatePlan | SMSOrVoicePlan | ConvertPlan

export type Product<T extends ProductType = ProductType> = {
    id: string
    type: T
    prices: T extends ProductType.Helpdesk
        ? HelpdeskPlan[]
        : T extends ProductType.Automation
          ? AutomatePlan[]
          : T extends ProductType.Voice | ProductType.SMS
            ? SMSOrVoicePlan[]
            : T extends ProductType.Convert
              ? ConvertPlan[]
              : never
}

type BasePlan = {
    product: ProductType
    num_quota_tickets: number // Integers only
    amount: number
    currency: string
    custom: boolean
    extra_ticket_cost: number
    plan_id: PlanId
    cadence: Cadence
    name: string
    price_id: string
    public: boolean
    // Set as optional to prevent breaking changes
    generation?: number
}

export type HelpdeskPlanFeatures = Record<
    AccountFeature,
    AccountFeatureMetadata
>

export type HelpdeskPlan = BasePlan & {
    num_quota_tickets: number
    integrations: number
    is_legacy: boolean
    features: HelpdeskPlanFeatures
}

export type AutomatePlanFeatures = Record<
    | AccountFeature.AutomationTrackOrderFlow
    | AccountFeature.AutomationReportIssueFlow
    | AccountFeature.AutomationCancellationsFlow
    | AccountFeature.AutomationReturnFlow
    | AccountFeature.AutomationSelfServiceStatistics
    | AccountFeature.AutomationManagedRules,
    AccountFeatureMetadata
>

export type AutomatePlan = BasePlan & {
    features: AutomatePlanFeatures
}

export type AutomateEarlyAccessPlan = AutomatePlan & {
    amount_after_discount: number
    discount: number
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
        current_plan_id: PlanId
        scheduled_plan_id: PlanId | null
        scheduled_plan: Plan | null
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
    products: ProductType[]
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

export enum SubscriptionStatus {
    ACTIVE = 'active',
    CANCELED = 'canceled',
    TRIALING = 'trialing',
}

export type StripePaymentMethodType =
    | 'ach_credit_transfer'
    | 'us_bank_account' // ACH debit
    | 'card'

export type SubscriptionSummary = {
    status: SubscriptionStatus
    cadence: Cadence
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
    trial_extended_until: string | null // isoformatted datetime
}

export type CreditCard = {
    brand: string
    last4: string
    exp_month: number
    exp_year: number
}

export type ShopifyBilling = {
    subscription_id: string | null
}
export type AchCreditBankAccount = {
    bank_name: string
    last4: string
}

export type AchDebitBankAccount = {
    bank_name: string
    last4: string
}

type CustomerSummary = {
    trial_extended_until?: string | null // isoformatted datetime
    coupon?: CouponSummary | null
    credit_card?: CreditCard | null
    shopify_billing?: ShopifyBilling | null
    ach_debit_bank_account?: AchDebitBankAccount | null
    ach_credit_bank_account?: AchCreditBankAccount | null
}

export type CurrentPlans = {
    helpdesk: HelpdeskPlan
    automate: AutomatePlan | null
    voice: SMSOrVoicePlan | null
    sms: SMSOrVoicePlan | null
    convert: ConvertPlan | null
}
export type BillingState = {
    upcoming_invoice: UpcomingInvoiceSummary | null
    subscription: SubscriptionSummary
    customer: CustomerSummary
    current_plans: CurrentPlans
}

export type CouponForSales = string[]

export interface ICard {
    brand: string
    last4: string
    exp_month: number
    exp_year: number
}
