import type {
    DiscountVO,
    InvoiceCadence,
    ScheduledChange,
} from '@gorgias/helpdesk-types'

export enum AccountFeature {
    Api1stPartyRateLimit = 'api_1st_party_rate_limit',
    Api3rdPartyRateLimit = 'api_3rd_party_rate_limit',
    AutoAssignment = 'auto_assignment',
    FacebookComment = 'facebook_comment',
    InstagramComment = 'instagram_comment',
    InstagramDirectMessage = 'instagram_dm',
    UsersLiveStatistics = 'users_live_statistics',
    OverviewLiveStatistics = 'overview_live_statistics',
    MagentoIntegration = 'magento_integration',
    TwitterIntegration = 'twitter_integration',
    YotpoIntegration = 'yotpo_integration',
    RevenueStatistics = 'revenue_statistics',
    SatisfactionSurveys = 'satisfaction_surveys',
    PhoneNumber = 'phone_number',
    Teams = 'teams',
    UserRoles = 'user_roles',
    ViewSharing = 'view_sharing',
    HelpCenter = 'help_center',
    AutomationTrackOrderFlow = 'automation_track_order_flow',
    AutomationReportIssueFlow = 'automation_report_issue_flow',
    AutomationCancellationsFlow = 'automation_cancellations_flow',
    AutomationReturnFlow = 'automation_return_flow',
    AutomationSelfServiceStatistics = 'automation_self_service_statistics',
    AutomationOpportunities = 'automation_opportunities',
    AutomationManagedRules = 'automation_managed_rules',
}

export type AccountFeatureMetadata = {
    enabled: boolean
    limit?: number
    rate_limit?: {
        interval_ms: number
        max_burst: number
    }
}

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

export type PlanId = string

export type Plan = HelpdeskPlan | AutomatePlan | SMSOrVoicePlan | ConvertPlan

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

export type AvailablePlansOf<T extends ProductType = ProductType> = {
    type: T
    prices: PlanForProductType<T>[]
}

type BasePlan = {
    product: ProductType
    num_quota_tickets: number
    amount: number
    currency: string
    custom?: boolean
    extra_ticket_cost: number
    plan_id: PlanId
    cadence: Cadence
    invoice_cadence: InvoiceCadence
    name: string
    public: boolean
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
    tier: HelpdeskPlanTier | undefined
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
    tier?: number | null
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
    helpdesk?: ProductUsage | null
    automation?: ProductUsage | null
    sms?: ProductUsage | null
    voice?: ProductUsage | null
    convert?: ProductUsage | null
}

export type UpcomingInvoiceSummary = {
    coupon: CouponSummary | null
    subtotal_in_cents: number
    subtotal_decimal: string
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
    INCOMPLETE = 'incomplete',
    INCOMPLETE_EXPIRED = 'incomplete_expired',
    PAST_DUE = 'past_due',
    TRIALING = 'trialing',
    UNPAID = 'unpaid',
}

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
    scheduled_changes: ScheduledChange[]
    scheduled_to_cancel_at: string | null
    current_billing_cycle_start_datetime: string
    current_billing_cycle_end_datetime: string
    // TODO(CRMGROW-3557): `coupon` is legacy — equals `coupons[0]`, omits
    // stacked and non-coupon discounts. Read from `discounts` instead.
    coupon: CouponSummary | null
    discounts: DiscountVO[]
    trial_extended_until: string | null
    resource_version: number
    schedule_resource_version?: number | null
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
    trial_extended_until?: string | null
    coupon?: CouponSummary | null
    credit_card?: CreditCard | null
    shopify_billing?: ShopifyBilling | null
    ach_debit_bank_account?: AchDebitBankAccount | null
    ach_credit_bank_account?: AchCreditBankAccount | null
    payment_term_days: number | null
    is_vetted: boolean
    billing_address_validation_status?: BillingAddressValidationStatus | null
    unbilled_charges?: number | null
}

export type CurrentPlans = {
    helpdesk: HelpdeskPlan
    automate: AutomatePlan | null
    voice: SMSOrVoicePlan | null
    sms: SMSOrVoicePlan | null
    convert: ConvertPlan | null
}

export type BillingPlanName = keyof CurrentPlans

export type BillingState = {
    upcoming_invoice: UpcomingInvoiceSummary | null
    subscription: SubscriptionSummary
    customer: CustomerSummary
    current_plans: CurrentPlans
}

export enum PaymentType {
    Stripe = 'stripe',
    Shopify = 'shopify',
}

export enum PaymentIntentStatus {
    RequiresSource = 'requires_source',
    RequiresConfirmation = 'requires_source_action',
    RequiresPaymentMethod = 'requires_payment_method',
    Succeeded = 'succeeded',
}

export type Invoice = {
    total: number
    amount_paid: number
    amount_due: number
    attempted: boolean
    date: number
    description: string | null
    id: string
    invoice_pdf: string
    metadata: {
        payment_service: PaymentType
        extra_tickets?: string
        extra_usage?: string
        gorgias_release?: string
    }
    paid: boolean
    payment_confirmation_url: string | null
    payment_intent: {
        status: PaymentIntentStatus
    }
    has_payment_schedules?: boolean
}

export enum TaxIdType {
    eu_vat = 'eu_vat',
    au_abn = 'au_abn',
    ca_gst_hst = 'ca_gst_hst',
    ca_pst_bc = 'ca_pst_bc',
    ca_pst_mb = 'ca_pst_mb',
    ca_pst_sk = 'ca_pst_sk',
    ca_qst = 'ca_qst',
}

export enum TaxIdVerificationStatus {
    Pending = 'pending',
    Verified = 'verified',
    Unverified = 'unverified',
    Unavailable = 'unavailable',
}

export type TaxId<Type extends TaxIdType = TaxIdType> = {
    type: Type
    value: string
    verification: TaxIdVerificationStatus
}

export enum VATCountries {
    AT = 'AT',
    BE = 'BE',
    BG = 'BG',
    CY = 'CY',
    CZ = 'CZ',
    DE = 'DE',
    DK = 'DK',
    EE = 'EE',
    ES = 'ES',
    FI = 'FI',
    FR = 'FR',
    GR = 'GR',
    HR = 'HR',
    HU = 'HU',
    IE = 'IE',
    IT = 'IT',
    LT = 'LT',
    LU = 'LU',
    LV = 'LV',
    MT = 'MT',
    NL = 'NL',
    PL = 'PL',
    PT = 'PT',
    RO = 'RO',
    SE = 'SE',
    SI = 'SI',
    SK = 'SK',
}

export type CancellationDates = Partial<Record<ProductType, string | null>>

export type ScheduledChangeInfo = {
    date: string
    targetPlan: ScheduledChange['scheduled_plan']
}

export type ScheduledChangesByProduct = Partial<
    Record<ProductType, ScheduledChangeInfo | null>
>

export type PlansByProduct = {
    [K in ProductType]: {
        current?: PlanForProductType<K>
        available: PlanForProductType<K>[]
    }
}

export type SelectedPlans = {
    [K in ProductType]: {
        plan?: PlanForProductType<K>
        isSelected: boolean
        autoUpgrade?: boolean
    }
}

export type ProductSubscriptionDescriptions = {
    [key: string]: ProductSubscriptionDescription
}

export type ProductSubscriptionDescription = {
    detailsLink?: {
        label: string
        url: string
    }
    features?: string[]
}

export type Reason = {
    label: string
    value: boolean
}
