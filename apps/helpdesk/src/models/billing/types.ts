import type { InvoiceCadence } from '@gorgias/helpdesk-types'

import type {
    AccountFeature,
    AccountFeatureMetadata,
} from 'state/currentAccount/types'

export enum Cadence {
    Month = 'month',
    Quarter = 'quarter',
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

export type ProductInfo = {
    title: string
    icon: string
    counter: string
    perTicket: string
    tooltip: string
    tooltipLink: string
    bannerLink: string
}

export type PlanForProductType<T extends ProductType> =
    T extends ProductType.Helpdesk
        ? HelpdeskPlan
        : T extends ProductType.Automation
          ? AutomatePlan
          : T extends ProductType.Voice | ProductType.SMS
            ? SMSOrVoicePlan
            : T extends ProductType.Convert
              ? ConvertPlan
              : never

// A PlanId is billing-provider agnostic.
export type PlanId = string

export type Plan = HelpdeskPlan | AutomatePlan | SMSOrVoicePlan | ConvertPlan

export type AvailablePlansOf<T extends ProductType = ProductType> = {
    type: T
    prices: PlanForProductType<T>[]
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
    invoice_cadence: InvoiceCadence
    name: string
    public: boolean
    // Set as optional to prevent breaking changes
    generation?: number
}

export type HelpdeskPlanFeatures = Record<
    AccountFeature,
    AccountFeatureMetadata
>

export enum HelpdeskPlanTier {
    STARTER = 'Starter',
    BASIC = 'Basic',
    ADVANCED = 'Advanced',
    PRO = 'Pro',
    CUSTOM = 'Custom',
    OTHER = 'Other',
}

export type HelpdeskPlan = BasePlan & {
    num_quota_tickets: number
    integrations: number
    is_legacy: boolean
    features: HelpdeskPlanFeatures
    tier: HelpdeskPlanTier
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

export enum BillingAddressValidationStatus {
    NotValidated = 'not_validated',
    Valid = 'valid',
    PartiallyValid = 'partially_valid',
    Invalid = 'invalid',
}

export enum SubscriptionStatus {
    ACTIVE = 'active',
    CANCELED = 'canceled',
    PAST_DUE = 'past_due',
    TRIALING = 'trialing',
}

export type StripePaymentMethodType =
    | 'ach_credit_transfer'
    | 'us_bank_account' // ACH debit
    | 'card'

export type SubscriptionSummary = {
    status: SubscriptionStatus
    cadence: Cadence
    invoice_cadence: InvoiceCadence
    is_paused: boolean
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
    payment_term_days: number | null
    is_vetted: boolean
    billing_address_validation_status: BillingAddressValidationStatus
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
