import type { InvoiceCadence } from '@gorgias/helpdesk-types'

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
    AutomationAddonOverview = 'automation_addon_overview',
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
    custom: boolean
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

export type PlansByProduct = {
    [ProductType.Helpdesk]: {
        current?: HelpdeskPlan
        available: HelpdeskPlan[]
    }
    [ProductType.Automation]: {
        current?: AutomatePlan
        available: AutomatePlan[]
    }
    [ProductType.Voice]: {
        current?: SMSOrVoicePlan
        available: SMSOrVoicePlan[]
    }
    [ProductType.SMS]: { current?: SMSOrVoicePlan; available: SMSOrVoicePlan[] }
    [ProductType.Convert]: { current?: ConvertPlan; available: ConvertPlan[] }
}

export type SelectedPlans = {
    [ProductType.Helpdesk]: {
        plan?: HelpdeskPlan
        isSelected: boolean
        autoUpgrade?: false
    }
    [ProductType.Automation]: {
        plan?: AutomatePlan
        isSelected: boolean
        autoUpgrade?: false
    }
    [ProductType.Voice]: {
        plan?: SMSOrVoicePlan
        isSelected: boolean
        autoUpgrade?: false
    }
    [ProductType.SMS]: {
        plan?: SMSOrVoicePlan
        isSelected: boolean
        autoUpgrade?: false
    }
    [ProductType.Convert]: {
        plan?: ConvertPlan
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
