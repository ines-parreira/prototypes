import { InvoiceCadence } from '@gorgias/helpdesk-types'

import type {
    AutomatePlan,
    AutomatePlanFeatures,
    AvailablePlansOf,
    ConvertPlan,
    HelpdeskPlan,
    HelpdeskPlanFeatures,
    SMSOrVoicePlan,
} from 'models/billing/types'
import { Cadence, HelpdeskPlanTier, ProductType } from 'models/billing/types'
import type { CurrentProductsUsages } from 'state/billing/types'
import { AccountFeature } from 'state/currentAccount/types'

export const basicHelpdeskPlanFeatures: HelpdeskPlanFeatures = {
    [AccountFeature.Api1stPartyRateLimit]: {
        enabled: true,
        rate_limit: {
            interval_ms: 2000,
            max_burst: 40,
        },
    },
    [AccountFeature.Api3rdPartyRateLimit]: {
        enabled: true,
        rate_limit: {
            interval_ms: 20000,
            max_burst: 40,
        },
    },
    [AccountFeature.AutoAssignment]: { enabled: true },
    [AccountFeature.FacebookComment]: { enabled: true },
    [AccountFeature.InstagramComment]: { enabled: true },
    [AccountFeature.InstagramDirectMessage]: { enabled: true },
    [AccountFeature.OverviewLiveStatistics]: { enabled: true },
    [AccountFeature.UsersLiveStatistics]: { enabled: false },
    [AccountFeature.MagentoIntegration]: { enabled: false },
    [AccountFeature.PhoneNumber]: { enabled: true, limit: 1 },
    [AccountFeature.TwitterIntegration]: { enabled: false, limit: 0 },
    [AccountFeature.YotpoIntegration]: { enabled: true },
    [AccountFeature.RevenueStatistics]: { enabled: false },
    [AccountFeature.SatisfactionSurveys]: { enabled: true },
    [AccountFeature.Teams]: { enabled: true },
    [AccountFeature.UserRoles]: { enabled: true },
    [AccountFeature.ViewSharing]: { enabled: true },
    [AccountFeature.HelpCenter]: { enabled: true },
    [AccountFeature.AutomationManagedRules]: { enabled: false },
    [AccountFeature.AutomationTrackOrderFlow]: { enabled: false },
    [AccountFeature.AutomationReportIssueFlow]: { enabled: false },
    [AccountFeature.AutomationCancellationsFlow]: { enabled: false },
    [AccountFeature.AutomationReturnFlow]: { enabled: false },
    [AccountFeature.AutomationSelfServiceStatistics]: { enabled: false },
    [AccountFeature.AutomationAddonOverview]: { enabled: false },
}

export const automatePlanFeatures: AutomatePlanFeatures = {
    [AccountFeature.AutomationManagedRules]: { enabled: true },
    [AccountFeature.AutomationTrackOrderFlow]: { enabled: true },
    [AccountFeature.AutomationReportIssueFlow]: { enabled: true },
    [AccountFeature.AutomationCancellationsFlow]: { enabled: true },
    [AccountFeature.AutomationReturnFlow]: { enabled: true },
    [AccountFeature.AutomationSelfServiceStatistics]: { enabled: true },
}
const proHelpdeskPlanFeatures: HelpdeskPlanFeatures = {
    [AccountFeature.Api1stPartyRateLimit]: {
        enabled: true,
        rate_limit: { interval_ms: 2000, max_burst: 40 },
    },
    [AccountFeature.Api3rdPartyRateLimit]: {
        enabled: true,
        rate_limit: { interval_ms: 20000, max_burst: 40 },
    },
    [AccountFeature.AutoAssignment]: { enabled: true },
    [AccountFeature.FacebookComment]: { enabled: true },
    [AccountFeature.InstagramComment]: { enabled: true },
    [AccountFeature.InstagramDirectMessage]: { enabled: true },
    [AccountFeature.UsersLiveStatistics]: { enabled: true },
    [AccountFeature.OverviewLiveStatistics]: { enabled: true },
    [AccountFeature.MagentoIntegration]: { enabled: true },
    [AccountFeature.PhoneNumber]: { enabled: true, limit: 3 },
    [AccountFeature.TwitterIntegration]: { enabled: false, limit: 0 },
    [AccountFeature.YotpoIntegration]: { enabled: true },
    [AccountFeature.RevenueStatistics]: { enabled: true },
    [AccountFeature.SatisfactionSurveys]: { enabled: true },
    [AccountFeature.Teams]: { enabled: true },
    [AccountFeature.UserRoles]: { enabled: true },
    [AccountFeature.ViewSharing]: { enabled: true },
    [AccountFeature.HelpCenter]: { enabled: true },
    [AccountFeature.AutomationManagedRules]: { enabled: false },
    [AccountFeature.AutomationTrackOrderFlow]: { enabled: false },
    [AccountFeature.AutomationReportIssueFlow]: { enabled: false },
    [AccountFeature.AutomationCancellationsFlow]: { enabled: false },
    [AccountFeature.AutomationReturnFlow]: { enabled: false },
    [AccountFeature.AutomationSelfServiceStatistics]: { enabled: false },
    [AccountFeature.AutomationAddonOverview]: { enabled: false },
}

const advancedHelpdeskPlanFeatures: HelpdeskPlanFeatures = {
    [AccountFeature.Api1stPartyRateLimit]: {
        enabled: true,
        rate_limit: { interval_ms: 2000, max_burst: 40 },
    },
    [AccountFeature.Api3rdPartyRateLimit]: {
        enabled: true,
        rate_limit: { interval_ms: 20000, max_burst: 40 },
    },
    [AccountFeature.AutoAssignment]: { enabled: true },
    [AccountFeature.FacebookComment]: { enabled: true },
    [AccountFeature.InstagramComment]: { enabled: true },
    [AccountFeature.InstagramDirectMessage]: { enabled: true },
    [AccountFeature.UsersLiveStatistics]: { enabled: true },
    [AccountFeature.OverviewLiveStatistics]: { enabled: true },
    [AccountFeature.MagentoIntegration]: { enabled: true },
    [AccountFeature.PhoneNumber]: { enabled: true, limit: 10 },
    [AccountFeature.TwitterIntegration]: { enabled: true, limit: 2 },
    [AccountFeature.YotpoIntegration]: { enabled: true },
    [AccountFeature.RevenueStatistics]: { enabled: true },
    [AccountFeature.SatisfactionSurveys]: { enabled: true },
    [AccountFeature.Teams]: { enabled: true },
    [AccountFeature.UserRoles]: { enabled: true },
    [AccountFeature.ViewSharing]: { enabled: true },
    [AccountFeature.HelpCenter]: { enabled: true },
    [AccountFeature.AutomationManagedRules]: { enabled: false },
    [AccountFeature.AutomationTrackOrderFlow]: { enabled: false },
    [AccountFeature.AutomationReportIssueFlow]: { enabled: false },
    [AccountFeature.AutomationCancellationsFlow]: { enabled: false },
    [AccountFeature.AutomationReturnFlow]: { enabled: false },
    [AccountFeature.AutomationSelfServiceStatistics]: { enabled: false },
    [AccountFeature.AutomationAddonOverview]: { enabled: false },
}

const customHelpdeskPlanFeatures: HelpdeskPlanFeatures = {
    [AccountFeature.Api1stPartyRateLimit]: {
        enabled: true,
        rate_limit: { interval_ms: 4000, max_burst: 200 },
    },
    [AccountFeature.Api3rdPartyRateLimit]: {
        enabled: true,
        rate_limit: { interval_ms: 10000, max_burst: 40 },
    },
    [AccountFeature.AutoAssignment]: { enabled: true },
    [AccountFeature.FacebookComment]: { enabled: true },
    [AccountFeature.InstagramComment]: { enabled: true },
    [AccountFeature.InstagramDirectMessage]: { enabled: true },
    [AccountFeature.UsersLiveStatistics]: { enabled: true },
    [AccountFeature.OverviewLiveStatistics]: { enabled: true },
    [AccountFeature.MagentoIntegration]: { enabled: true },
    [AccountFeature.PhoneNumber]: { enabled: true, limit: 150 },
    [AccountFeature.TwitterIntegration]: { enabled: true, limit: 10 },
    [AccountFeature.YotpoIntegration]: { enabled: true },
    [AccountFeature.RevenueStatistics]: { enabled: true },
    [AccountFeature.SatisfactionSurveys]: { enabled: true },
    [AccountFeature.Teams]: { enabled: true },
    [AccountFeature.UserRoles]: { enabled: true },
    [AccountFeature.ViewSharing]: { enabled: true },
    [AccountFeature.HelpCenter]: { enabled: true },
    [AccountFeature.AutomationManagedRules]: { enabled: false },
    [AccountFeature.AutomationTrackOrderFlow]: { enabled: false },
    [AccountFeature.AutomationReportIssueFlow]: { enabled: false },
    [AccountFeature.AutomationCancellationsFlow]: { enabled: false },
    [AccountFeature.AutomationReturnFlow]: { enabled: false },
    [AccountFeature.AutomationSelfServiceStatistics]: { enabled: false },
    [AccountFeature.AutomationAddonOverview]: { enabled: false },
}

export const starterHelpdeskPlanFeatures: HelpdeskPlanFeatures = {
    [AccountFeature.Api1stPartyRateLimit]: {
        enabled: true,
        rate_limit: { interval_ms: 2000, max_burst: 40 },
    },
    [AccountFeature.Api3rdPartyRateLimit]: {
        enabled: true,
        rate_limit: { interval_ms: 20000, max_burst: 40 },
    },
    [AccountFeature.AutoAssignment]: { enabled: true },
    [AccountFeature.FacebookComment]: { enabled: true },
    [AccountFeature.InstagramComment]: { enabled: true },
    [AccountFeature.InstagramDirectMessage]: { enabled: true },
    [AccountFeature.OverviewLiveStatistics]: { enabled: false },
    [AccountFeature.UsersLiveStatistics]: { enabled: false },
    [AccountFeature.MagentoIntegration]: { enabled: false },
    [AccountFeature.PhoneNumber]: { enabled: false, limit: 0 },
    [AccountFeature.TwitterIntegration]: { enabled: false, limit: 0 },
    [AccountFeature.YotpoIntegration]: { enabled: true },
    [AccountFeature.RevenueStatistics]: { enabled: false },
    [AccountFeature.SatisfactionSurveys]: { enabled: true },
    [AccountFeature.Teams]: { enabled: true },
    [AccountFeature.UserRoles]: { enabled: true },
    [AccountFeature.ViewSharing]: { enabled: true },
    [AccountFeature.HelpCenter]: { enabled: true },
    [AccountFeature.AutomationManagedRules]: { enabled: false },
    [AccountFeature.AutomationTrackOrderFlow]: { enabled: false },
    [AccountFeature.AutomationReportIssueFlow]: { enabled: false },
    [AccountFeature.AutomationCancellationsFlow]: { enabled: false },
    [AccountFeature.AutomationReturnFlow]: { enabled: false },
    [AccountFeature.AutomationSelfServiceStatistics]: { enabled: false },
    [AccountFeature.AutomationAddonOverview]: { enabled: false },
}

export const basicMonthlyHelpdeskPlan: HelpdeskPlan = {
    custom: false,
    amount: 6000,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    currency: 'usd',
    extra_ticket_cost: 0.4,
    features: basicHelpdeskPlanFeatures,
    num_quota_tickets: 300,
    integrations: 150,
    is_legacy: false,
    plan_id: 'basic-monthly-usd-4',
    name: 'Basic',
    product: ProductType.Helpdesk,
    public: true,
    tier: HelpdeskPlanTier.BASIC,
}

export const basicQuarterlyHelpdeskPlan: HelpdeskPlan = {
    custom: false,
    amount: 6000,
    cadence: Cadence.Quarter,
    invoice_cadence: InvoiceCadence.Quarter,
    currency: 'usd',
    extra_ticket_cost: 0.4,
    features: basicHelpdeskPlanFeatures,
    num_quota_tickets: 300,
    integrations: 150,
    is_legacy: false,
    plan_id: 'basic-quarterly-usd-4',
    name: 'Basic',
    product: ProductType.Helpdesk,
    public: true,
    tier: HelpdeskPlanTier.BASIC,
}

export const basicYearlyHelpdeskPlan: HelpdeskPlan = {
    custom: false,
    amount: 60000,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Year,
    currency: 'usd',
    extra_ticket_cost: 0.4,
    features: basicHelpdeskPlanFeatures,
    num_quota_tickets: 3600,
    integrations: 150,
    is_legacy: false,
    plan_id: 'basic-yearly-usd-4',
    name: 'Basic',
    product: ProductType.Helpdesk,
    public: true,
    tier: HelpdeskPlanTier.BASIC,
}

export const basicYearlyHelpdeskPlan2: HelpdeskPlan = {
    custom: false,
    amount: 60000,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Year,
    currency: 'usd',
    extra_ticket_cost: 0.4,
    features: basicHelpdeskPlanFeatures,
    num_quota_tickets: 3600,
    integrations: 150,
    is_legacy: false,
    plan_id: 'basic-yearly-usd-4-2',
    name: 'Basic',
    product: ProductType.Helpdesk,
    public: true,
    tier: HelpdeskPlanTier.BASIC,
}

export const proMonthlyHelpdeskPlan: HelpdeskPlan = {
    custom: false,
    amount: 36000,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    currency: 'usd',
    extra_ticket_cost: 0.36,
    features: proHelpdeskPlanFeatures,
    num_quota_tickets: 2000,
    integrations: 150,
    is_legacy: false,
    plan_id: 'pro-monthly-usd-4',
    name: 'Pro',
    product: ProductType.Helpdesk,
    public: true,
    tier: HelpdeskPlanTier.PRO,
}

export const proQuarterlyHelpdeskPlan: HelpdeskPlan = {
    custom: false,
    amount: 36000,
    cadence: Cadence.Quarter,
    invoice_cadence: InvoiceCadence.Quarter,
    currency: 'usd',
    extra_ticket_cost: 0.36,
    features: proHelpdeskPlanFeatures,
    num_quota_tickets: 2000,
    integrations: 150,
    is_legacy: false,
    plan_id: 'pro-quarterly-usd-4',
    name: 'Pro',
    product: ProductType.Helpdesk,
    public: true,
    tier: HelpdeskPlanTier.PRO,
}

export const proYearlyHelpdeskPlan: HelpdeskPlan = {
    custom: false,
    amount: 360000,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Year,
    currency: 'usd',
    extra_ticket_cost: 0.36,
    features: proHelpdeskPlanFeatures,
    num_quota_tickets: 24000,
    integrations: 150,
    is_legacy: false,
    plan_id: 'pro-yearly-usd-4',
    name: 'Pro',
    product: ProductType.Helpdesk,
    public: true,
    tier: HelpdeskPlanTier.PRO,
}

export const advancedMonthlyHelpdeskPlan: HelpdeskPlan = {
    custom: false,
    amount: 90000,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    currency: 'usd',
    extra_ticket_cost: 0.36,
    features: advancedHelpdeskPlanFeatures,
    num_quota_tickets: 5000,
    integrations: 150,
    is_legacy: false,
    plan_id: 'advanced-monthly-usd-4',
    name: 'Advanced',
    product: ProductType.Helpdesk,
    public: true,
    tier: HelpdeskPlanTier.ADVANCED,
}

export const advancedQuarterlyHelpdeskPlan: HelpdeskPlan = {
    custom: false,
    amount: 90000,
    cadence: Cadence.Quarter,
    invoice_cadence: InvoiceCadence.Quarter,
    currency: 'usd',
    extra_ticket_cost: 0.36,
    features: advancedHelpdeskPlanFeatures,
    num_quota_tickets: 5000,
    integrations: 150,
    is_legacy: false,
    plan_id: 'advanced-quarterly-usd-4',
    name: 'Advanced',
    product: ProductType.Helpdesk,
    public: true,
    tier: HelpdeskPlanTier.ADVANCED,
}

export const advancedYearlyHelpdeskPlan: HelpdeskPlan = {
    custom: false,
    amount: 900000,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Year,
    currency: 'usd',
    extra_ticket_cost: 0.36,
    features: advancedHelpdeskPlanFeatures,
    num_quota_tickets: 60000,
    integrations: 150,
    is_legacy: false,
    plan_id: 'advanced-yearly-usd-4',
    name: 'Advanced',
    product: ProductType.Helpdesk,
    public: true,
    tier: HelpdeskPlanTier.ADVANCED,
}

export const earlyAccessMonthlyAutomationPlan: AutomatePlan = {
    custom: false,
    public: true,
    amount: 3000,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    extra_ticket_cost: 0.2,
    num_quota_tickets: 30,
    currency: 'usd',
    features: automatePlanFeatures,
    plan_id: 'aut-free-monthly-usd-6',
    name: 'Early Access',
    product: ProductType.Automation,
}

export const basicMonthlyAutomationPlan: AutomatePlan = {
    custom: false,
    public: true,
    amount: 3000,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    extra_ticket_cost: 0.2,
    num_quota_tickets: 30,
    currency: 'usd',
    features: automatePlanFeatures,
    plan_id: 'aut-addon-basic-full-price-monthly-usd-4',
    name: 'Basic',
    product: ProductType.Automation,
}

export const legacyAutomatePlan: AutomatePlan = {
    ...basicMonthlyAutomationPlan,
    public: false,
    amount: basicMonthlyAutomationPlan.amount + 1, // slightly more costly to not rearrange lots of tests just to be undone when removed
    num_quota_tickets: null as unknown as number, // Force the typing to allow null to create this legacy plan
    plan_id: 'free-automation',
    name: 'Legacy Free Automation',
}

export const firstTierMonthlyAutomationPlan: AutomatePlan = {
    custom: false,
    public: true,
    amount: 3000,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    extra_ticket_cost: 1.5,
    num_quota_tickets: 30,
    currency: 'usd',
    generation: 6,
    features: automatePlanFeatures,
    plan_id: 'aut-01-monthly-usd-6',
    name: 'Tier 1',
    product: ProductType.Automation,
}

export const firstTierQuarterlyAutomationPlan: AutomatePlan = {
    custom: false,
    public: true,
    amount: 9000,
    cadence: Cadence.Quarter,
    invoice_cadence: InvoiceCadence.Quarter,
    extra_ticket_cost: 1.5,
    num_quota_tickets: 90,
    currency: 'usd',
    generation: 6,
    features: automatePlanFeatures,
    plan_id: 'aut-01-quarterly-usd-6',
    name: 'Tier 1',
    product: ProductType.Automation,
}

export const firstTierYearlyAutomationPlan: AutomatePlan = {
    custom: false,
    public: true,
    amount: 30000,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Year,
    extra_ticket_cost: 1.5,
    num_quota_tickets: 360,
    currency: 'usd',
    generation: 6,
    features: automatePlanFeatures,
    plan_id: 'aut-01-yearly-usd-6',
    name: 'Tier 1',
    product: ProductType.Automation,
}

export const basicQuarterlyAutomationPlan: AutomatePlan = {
    custom: false,
    public: true,
    amount: 30000,
    cadence: Cadence.Quarter,
    invoice_cadence: InvoiceCadence.Quarter,
    extra_ticket_cost: 0.2,
    num_quota_tickets: 360,
    currency: 'usd',
    features: automatePlanFeatures,
    plan_id: 'aut-addon-basic-full-price-quarterly-usd-4',
    name: 'Basic',
    product: ProductType.Automation,
}

export const basicYearlyAutomationPlan: AutomatePlan = {
    custom: false,
    public: true,
    amount: 30000,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Year,
    extra_ticket_cost: 0.2,
    num_quota_tickets: 360,
    currency: 'usd',
    features: automatePlanFeatures,
    plan_id: 'aut-addon-basic-full-price-yearly-usd-4',
    name: 'Basic',
    product: ProductType.Automation,
}

export const basicYearlyInvoicedMonthlyAutomationPlan: AutomatePlan = {
    custom: false,
    public: true,
    amount: 3000,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Month,
    extra_ticket_cost: 0.2,
    num_quota_tickets: 360,
    currency: 'usd',
    features: automatePlanFeatures,
    plan_id: 'aut-addon-basic-full-price-yearly-invoiced-monthly-usd-4',
    name: 'Basic (Invoiced Monthly)',
    product: ProductType.Automation,
}

export const proMonthlyAutomationPlan: AutomatePlan = {
    custom: false,
    public: true,
    extra_ticket_cost: 0.18,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    num_quota_tickets: 190,
    amount: 18000,
    currency: 'usd',
    features: automatePlanFeatures,
    plan_id: 'aut-addon-pro-full-price-monthly-usd-4',
    name: 'Pro',
    product: ProductType.Automation,
}

export const proQuarterlyAutomationPlan: AutomatePlan = {
    custom: false,
    public: true,
    extra_ticket_cost: 0.18,
    cadence: Cadence.Quarter,
    invoice_cadence: InvoiceCadence.Quarter,
    num_quota_tickets: 190,
    amount: 18000,
    currency: 'usd',
    features: automatePlanFeatures,
    plan_id: 'aut-addon-pro-full-price-quarterly-usd-4',
    name: 'Pro',
    product: ProductType.Automation,
}

export const proYearlyAutomationPlan: AutomatePlan = {
    custom: false,
    public: true,
    extra_ticket_cost: 0.18,
    num_quota_tickets: 2280,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Year,
    amount: 180000,
    currency: 'usd',
    features: automatePlanFeatures,
    plan_id: 'aut-addon-pro-full-price-yearly-usd-4',
    name: 'Pro',
    product: ProductType.Automation,
}

export const advancedMonthlyAutomatePlan: AutomatePlan = {
    custom: false,
    public: true,
    extra_ticket_cost: 0.18,
    num_quota_tickets: 530,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    amount: 45000,
    currency: 'usd',
    features: automatePlanFeatures,
    plan_id: 'aut-addon-advanced-full-price-monthly-usd-4',
    name: 'Advanced',
    product: ProductType.Automation,
}

export const advancedQuarterlyAutomatePlan: AutomatePlan = {
    custom: false,
    public: true,
    extra_ticket_cost: 0.18,
    num_quota_tickets: 530,
    cadence: Cadence.Quarter,
    invoice_cadence: InvoiceCadence.Quarter,
    amount: 45000,
    currency: 'usd',
    features: automatePlanFeatures,
    plan_id: 'aut-addon-advanced-full-price-quarterly-usd-4',
    name: 'Advanced',
    product: ProductType.Automation,
}

export const advancedYearlyAutomatePlan: AutomatePlan = {
    custom: false,
    public: true,
    extra_ticket_cost: 0.18,
    num_quota_tickets: 6360,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Year,
    amount: 450000,
    currency: 'usd',
    features: automatePlanFeatures,
    plan_id: 'aut-addon-advanced-full-price-yearly-usd-4',
    name: 'Advanced',
    product: ProductType.Automation,
}

export const automate02MonthlyMeteredPlan: AutomatePlan = {
    name: 'Automation 02 monthly usd-5',
    amount: 180_00,
    num_quota_tickets: 190,
    currency: 'usd',
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    extra_ticket_cost: 1.9,
    public: true,
    generation: 5,
    custom: false,
    plan_id: 'aut-02-monthly-usd-5',
    features: automatePlanFeatures,
    product: ProductType.Automation,
}

export const automate05YearlyMeteredPlan: AutomatePlan = {
    name: 'Automation 05 yearly usd-5',
    amount: 15000_00,
    num_quota_tickets: 24_000,
    currency: 'usd',
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Year,
    extra_ticket_cost: 1.25,
    public: true,
    custom: false,
    plan_id: 'aut-05-yearly-usd-5',
    features: automatePlanFeatures,
    product: ProductType.Automation,
}
export const legacyBasicHelpdeskPlan: HelpdeskPlan = {
    custom: false,
    amount: 6000,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    extra_ticket_cost: 0.06,
    currency: 'usd',
    features: basicHelpdeskPlanFeatures,
    num_quota_tickets: 600,
    integrations: 7,
    is_legacy: true,
    plan_id: 'basic-usd-1',
    name: 'Basic Plan',
    product: ProductType.Helpdesk,
    public: false,
    tier: HelpdeskPlanTier.BASIC,
}

export const customHelpdeskPlan: HelpdeskPlan = {
    amount: 160000,
    extra_ticket_cost: 0.32,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    currency: 'usd',
    custom: true,
    features: customHelpdeskPlanFeatures,
    num_quota_tickets: 10000,
    integrations: 150,
    is_legacy: false,
    plan_id: 'custom-monthly-usd-4-1',
    name: 'Custom',
    product: ProductType.Helpdesk,
    public: true,
    tier: HelpdeskPlanTier.CUSTOM,
}

export const starterHelpdeskPlan: HelpdeskPlan = {
    custom: false,
    amount: 1000,
    extra_ticket_cost: 0.4,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    currency: 'usd',
    features: starterHelpdeskPlanFeatures,
    num_quota_tickets: 50,
    integrations: 150,
    is_legacy: false,
    plan_id: 'starter-monthly-usd-4',
    name: 'Starter',
    product: ProductType.Helpdesk,
    public: false,
    tier: HelpdeskPlanTier.STARTER,
}

export const starterQuarterlyHelpdeskPlan: HelpdeskPlan = {
    custom: false,
    amount: 3000,
    extra_ticket_cost: 0.4,
    cadence: Cadence.Quarter,
    invoice_cadence: InvoiceCadence.Quarter,
    currency: 'usd',
    features: starterHelpdeskPlanFeatures,
    num_quota_tickets: 150,
    integrations: 150,
    is_legacy: false,
    plan_id: 'starter-quarterly-usd-4',
    name: 'Starter',
    product: ProductType.Helpdesk,
    public: false,
    tier: HelpdeskPlanTier.STARTER,
}

export const starterYearlyHelpdeskPlan: HelpdeskPlan = {
    custom: false,
    amount: 10000,
    extra_ticket_cost: 0.4,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Year,
    currency: 'usd',
    features: starterHelpdeskPlanFeatures,
    num_quota_tickets: 600,
    integrations: 150,
    is_legacy: false,
    plan_id: 'starter-yearly-usd-4',
    name: 'Starter',
    product: ProductType.Helpdesk,
    public: false,
    tier: HelpdeskPlanTier.STARTER,
}

export const basicYearlyInvoicedMonthlyHelpdeskPlan: HelpdeskPlan = {
    custom: true,
    amount: 5000,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Month,
    currency: 'usd',
    extra_ticket_cost: 0.4,
    features: basicHelpdeskPlanFeatures,
    num_quota_tickets: 3600,
    integrations: 150,
    is_legacy: false,
    plan_id: 'basic-yearly-invoiced-monthly-usd',
    name: 'Basic',
    product: ProductType.Helpdesk,
    public: false,
    tier: HelpdeskPlanTier.BASIC,
}

export const basicYearlyInvoicedQuarterlyHelpdeskPlan: HelpdeskPlan = {
    custom: true,
    amount: 15000,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Quarter,
    currency: 'usd',
    extra_ticket_cost: 0.4,
    features: basicHelpdeskPlanFeatures,
    num_quota_tickets: 3600,
    integrations: 150,
    is_legacy: false,
    plan_id: 'basic-yearly-invoiced-quarterly-usd',
    name: 'Basic',
    product: ProductType.Helpdesk,
    public: false,
    tier: HelpdeskPlanTier.BASIC,
}

export const basicYearlyInvoicedBiannuallyHelpdeskPlan: HelpdeskPlan = {
    custom: true,
    amount: 30000,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Biannual,
    currency: 'usd',
    extra_ticket_cost: 0.4,
    features: basicHelpdeskPlanFeatures,
    num_quota_tickets: 3600,
    integrations: 150,
    is_legacy: false,
    plan_id: 'basic-yearly-invoiced-biannually-usd',
    name: 'Basic',
    product: ProductType.Helpdesk,
    public: false,
    tier: HelpdeskPlanTier.BASIC,
}

export const voicePlan0: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 0,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    currency: 'usd',
    num_quota_tickets: 0,
    plan_id: 'voc-addon-00-monthly-usd-4',
    name: 'Voice Addon Trial Monthly',
    product: ProductType.Voice,
    extra_ticket_cost: 2.4,
}

export const voicePlan0Quarterly: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 0,
    cadence: Cadence.Quarter,
    invoice_cadence: InvoiceCadence.Quarter,
    currency: 'usd',
    num_quota_tickets: 0,
    plan_id: 'voc-addon-00-quarterly-usd-4',
    name: 'Voice Addon Trial Quarterly',
    product: ProductType.Voice,
    extra_ticket_cost: 2.4,
}

export const voicePlan0Yearly: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 0,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Year,
    currency: 'usd',
    num_quota_tickets: 0,
    plan_id: 'voc-addon-00-yearly-usd-4',
    name: 'Voice Addon Trial Yearly',
    product: ProductType.Voice,
    extra_ticket_cost: 2.4,
}

export const voicePlan1: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 175,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    currency: 'usd',
    num_quota_tickets: 250,
    plan_id: 'voc-addon-04-monthly-usd-4',
    name: 'Voice Addon 250 Monthly',
    product: ProductType.Voice,
    extra_ticket_cost: 1.4,
}

export const voicePlan2: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 1750,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    currency: 'usd',
    num_quota_tickets: 7500,
    plan_id: 'voc-addon-10-monthly-usd-4',
    name: 'Voice Addon 7500 Monthly',
    product: ProductType.Voice,
    extra_ticket_cost: 0.47,
}

export const voicePlan2Quarterly: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 5000,
    cadence: Cadence.Quarter,
    invoice_cadence: InvoiceCadence.Quarter,
    currency: 'usd',
    num_quota_tickets: 22500,
    plan_id: 'voc-addon-10-quarterly-usd-4',
    name: 'Voice Addon 7500 Quarterly',
    product: ProductType.Voice,
    extra_ticket_cost: 0.47,
}

export const voicePlan2Yearly: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 18000,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Year,
    currency: 'usd',
    num_quota_tickets: 90000,
    plan_id: 'voc-addon-10-yearly-usd-4',
    name: 'Voice Addon 7500 Yearly',
    product: ProductType.Voice,
    extra_ticket_cost: 0.47,
}

export const voicePlan2Monthly: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 2200,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    currency: 'usd',
    num_quota_tickets: 1000,
    plan_id: 'voc-addon-01-monthly-usd-5',
    name: 'Voice Addon 1000 Monthly',
    product: ProductType.Voice,
    extra_ticket_cost: 2.2,
}

export const voicePlan3: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 3000,
    cadence: Cadence.Quarter,
    invoice_cadence: InvoiceCadence.Quarter,
    currency: 'usd',
    num_quota_tickets: 300,
    plan_id: 'voc-addon-01-quarterly-usd-5',
    name: 'Voice Addon 300 Quarterly',
    product: ProductType.Voice,
    extra_ticket_cost: 2.2,
}

export const voicePlan4: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 3000,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Year,
    currency: 'usd',
    num_quota_tickets: 300,
    plan_id: 'voc-addon-01-yearly-usd-5',
    name: 'Voice Addon 300 Yearly',
    product: ProductType.Voice,
    extra_ticket_cost: 2.2,
}

export const smsPlan1: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 90,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    currency: 'usd',
    num_quota_tickets: 150,
    plan_id: 'sms-addon-03-monthly-usd-4',
    name: 'SMS Addon 150 Monthly',
    product: ProductType.SMS,
    extra_ticket_cost: 1.2,
}

export const smsPlan2: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 5768,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    currency: 'usd',
    num_quota_tickets: 15000,
    plan_id: 'sms-addon-12-monthly-usd-4',
    name: 'SMS Addon 15000 Monthly',
    product: ProductType.SMS,
    extra_ticket_cost: 0.77,
}

export const smsPlan2Quarterly: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 16500,
    cadence: Cadence.Quarter,
    invoice_cadence: InvoiceCadence.Quarter,
    currency: 'usd',
    num_quota_tickets: 45000,
    plan_id: 'sms-addon-12-quarterly-usd-4',
    name: 'SMS Addon 15000 Quarterly',
    product: ProductType.SMS,
    extra_ticket_cost: 0.77,
}

export const smsPlan2Yearly: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 60000,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Year,
    currency: 'usd',
    num_quota_tickets: 180000,
    plan_id: 'sms-addon-12-yearly-usd-4',
    name: 'SMS Addon 15000 Yearly',
    product: ProductType.SMS,
    extra_ticket_cost: 0.77,
}

export const smsPlan2Monthly: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 1900,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    currency: 'usd',
    num_quota_tickets: 5000,
    plan_id: 'sms-addon-01-monthly-usd-5',
    name: 'SMS Addon 5000 Monthly',
    product: ProductType.SMS,
    extra_ticket_cost: 1.5,
}

export const smsPlan3: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 200,
    cadence: Cadence.Quarter,
    invoice_cadence: InvoiceCadence.Quarter,
    currency: 'usd',
    num_quota_tickets: 300,
    plan_id: 'sms-addon-01-quarterly-usd-5',
    name: 'SMS Addon 300 Quarterly',
    product: ProductType.SMS,
    extra_ticket_cost: 1.5,
}

export const smsPlan4: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 200,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Year,
    currency: 'usd',
    num_quota_tickets: 300,
    plan_id: 'sms-addon-01-yearly-usd-5',
    name: 'SMS Addon 300 Yearly',
    product: ProductType.SMS,
    extra_ticket_cost: 1.5,
}

export const smsPlan0: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 0,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    currency: 'usd',
    num_quota_tickets: 0,
    plan_id: 'sms-addon-00-monthly-usd-4',
    name: 'SMS Addon Trial Monthly',
    product: ProductType.SMS,
    extra_ticket_cost: 1.6,
}

export const smsPlan0Quarterly: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 0,
    cadence: Cadence.Quarter,
    invoice_cadence: InvoiceCadence.Quarter,
    currency: 'usd',
    num_quota_tickets: 0,
    plan_id: 'sms-addon-00-quarterly-usd-4',
    name: 'SMS Addon Trial Quarterly',
    product: ProductType.SMS,
    extra_ticket_cost: 1.6,
}

export const smsPlan0Yearly: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 0,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Year,
    currency: 'usd',
    num_quota_tickets: 0,
    plan_id: 'sms-addon-00-yearly-usd-4',
    name: 'SMS Addon Trial Yearly',
    product: ProductType.SMS,
    extra_ticket_cost: 1.6,
}

export const convertPlan0: ConvertPlan = {
    custom: false,
    public: true,
    amount: 0,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    currency: 'usd',
    num_quota_tickets: 0,
    plan_id: 'convert-00-monthly-usd-5',
    name: 'Convert Trial Monthly',
    product: ProductType.Convert,
    extra_ticket_cost: 1,
    tier: 0,
}

export const convertPlan0Quarterly: ConvertPlan = {
    custom: false,
    public: true,
    amount: 0,
    cadence: Cadence.Quarter,
    invoice_cadence: InvoiceCadence.Quarter,
    currency: 'usd',
    num_quota_tickets: 0,
    plan_id: 'convert-00-quarterly-usd-5',
    name: 'Convert Trial Quarterly',
    product: ProductType.Convert,
    extra_ticket_cost: 1,
    tier: 0,
}

export const convertPlan0Yearly: ConvertPlan = {
    custom: false,
    public: true,
    amount: 0,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Year,
    currency: 'usd',
    num_quota_tickets: 0,
    plan_id: 'convert-00-yearly-usd-5',
    name: 'Convert Trial Yearly',
    product: ProductType.Convert,
    extra_ticket_cost: 1,
    tier: 0,
}

export const convertPlan1: ConvertPlan = {
    custom: false,
    public: true,
    amount: 3000,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    currency: 'usd',
    num_quota_tickets: 50,
    plan_id: 'convert-01-monthly-usd-5',
    name: 'Convert 50 Monthly',
    product: ProductType.Convert,
    extra_ticket_cost: 0,
    tier: 1,
}

export const convertPlan1Quarterly: ConvertPlan = {
    custom: false,
    public: true,
    amount: 9000,
    cadence: Cadence.Quarter,
    invoice_cadence: InvoiceCadence.Quarter,
    currency: 'usd',
    num_quota_tickets: 150,
    plan_id: 'convert-01-quarterly-usd-5',
    name: 'Convert 150 Quarterly',
    product: ProductType.Convert,
    extra_ticket_cost: 0,
    tier: 1,
}

export const convertPlan1Yearly: ConvertPlan = {
    custom: false,
    public: true,
    amount: 30000,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Year,
    currency: 'usd',
    num_quota_tickets: 600,
    plan_id: 'convert-01-yearly-usd-5',
    name: 'Convert 600 Yearly',
    product: ProductType.Convert,
    extra_ticket_cost: 0,
    tier: 1,
}

export const convertPlan2: ConvertPlan = {
    custom: false,
    public: true,
    amount: 25000,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    currency: 'usd',
    num_quota_tickets: 500,
    plan_id: 'convert-02-monthly-usd-5',
    name: 'Convert 500 Monthly',
    product: ProductType.Convert,
    extra_ticket_cost: 0,
    tier: 2,
}

export const convertPlan2Quarterly: ConvertPlan = {
    custom: false,
    public: true,
    amount: 75000,
    cadence: Cadence.Quarter,
    invoice_cadence: InvoiceCadence.Quarter,
    currency: 'usd',
    num_quota_tickets: 1500,
    plan_id: 'convert-02-quarterly-usd-5',
    name: 'Convert 1,500 Quarterly',
    product: ProductType.Convert,
    extra_ticket_cost: 0,
    tier: 2,
}

export const convertPlan2Yearly: ConvertPlan = {
    custom: false,
    public: true,
    amount: 250000,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Year,
    currency: 'usd',
    num_quota_tickets: 6000,
    plan_id: 'convert-02-yearly-usd-5',
    name: 'Convert 6,000 Yearly',
    product: ProductType.Convert,
    extra_ticket_cost: 0,
    tier: 2,
}

export const convertPlan3: ConvertPlan = {
    custom: false,
    public: true,
    amount: 80000,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    currency: 'usd',
    num_quota_tickets: 2000,
    plan_id: 'convert-03-monthly-usd-5',
    name: 'Convert 2,000 Monthly',
    product: ProductType.Convert,
    extra_ticket_cost: 0,
    tier: 3,
}

export const convertPlan3Quarterly: ConvertPlan = {
    custom: false,
    public: true,
    amount: 240000,
    cadence: Cadence.Quarter,
    invoice_cadence: InvoiceCadence.Quarter,
    currency: 'usd',
    num_quota_tickets: 6000,
    plan_id: 'convert-03-quarterly-usd-5',
    name: 'Convert 6,000 Quarterly',
    product: ProductType.Convert,
    extra_ticket_cost: 0,
    tier: 3,
}

export const convertPlan3Yearly: ConvertPlan = {
    custom: false,
    public: true,
    amount: 800000,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Year,
    currency: 'usd',
    num_quota_tickets: 24000,
    plan_id: 'convert-03-yearly-usd-5',
    name: 'Convert 24,000 Yearly',
    product: ProductType.Convert,
    extra_ticket_cost: 0,
    tier: 3,
}

export const convertPlan4: ConvertPlan = {
    custom: false,
    public: true,
    amount: 110000,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    currency: 'usd',
    num_quota_tickets: 2000,
    plan_id: 'convert-04-monthly-usd-6',
    name: 'Convert 2,000 Monthly',
    product: ProductType.Convert,
    extra_ticket_cost: 0,
    tier: 4,
}

export const convertPlan5: ConvertPlan = {
    custom: false,
    public: true,
    amount: 157500,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    currency: 'usd',
    num_quota_tickets: 3000,
    plan_id: 'convert-05-monthly-usd-6',
    name: 'Convert 3,000 Monthly',
    product: ProductType.Convert,
    extra_ticket_cost: 0,
    tier: 5,
}

export const convertPlan6: ConvertPlan = {
    custom: false,
    public: true,
    amount: 36000,
    cadence: Cadence.Quarter,
    invoice_cadence: InvoiceCadence.Quarter,
    currency: 'usd',
    num_quota_tickets: 600,
    plan_id: 'convert-05-quarterly-usd-6',
    name: 'Convert 600 Quarterly',
    product: ProductType.Convert,
    extra_ticket_cost: 0,
    tier: 1,
}

export const convertPlan7: ConvertPlan = {
    custom: false,
    public: true,
    amount: 36000,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Year,
    currency: 'usd',
    num_quota_tickets: 600,
    plan_id: 'convert-05-yearly-usd-6',
    name: 'Convert 600 Yearly',
    product: ProductType.Convert,
    extra_ticket_cost: 0,
    tier: 1,
}

// these PRODUCT_ID constants are only used in tests and are remnants of having Stripe Product IDs leaked to the Frontend
export const HELPDESK_PRODUCT_ID = ProductType.Helpdesk
export const AUTOMATION_PRODUCT_ID = ProductType.Automation
export const VOICE_PRODUCT_ID = ProductType.Voice
export const SMS_PRODUCT_ID = ProductType.SMS
export const CONVERT_PRODUCT_ID = ProductType.Convert

export const helpdeskAvailablePlans = [
    starterHelpdeskPlan,
    starterQuarterlyHelpdeskPlan,
    starterYearlyHelpdeskPlan,
    basicMonthlyHelpdeskPlan,
    basicQuarterlyHelpdeskPlan,
    basicYearlyHelpdeskPlan,
    proMonthlyHelpdeskPlan,
    proQuarterlyHelpdeskPlan,
    proYearlyHelpdeskPlan,
    advancedMonthlyHelpdeskPlan,
    advancedQuarterlyHelpdeskPlan,
    advancedYearlyHelpdeskPlan,
].sort((a, b) => a.amount - b.amount) // Sort to match behaviour in redux selector

export const automationAvailablePlans = [
    legacyAutomatePlan,
    basicMonthlyAutomationPlan,
    basicQuarterlyAutomationPlan,
    basicYearlyAutomationPlan,
    proMonthlyAutomationPlan,
    proQuarterlyAutomationPlan,
    proYearlyAutomationPlan,
    advancedMonthlyAutomatePlan,
    advancedQuarterlyAutomatePlan,
    advancedYearlyAutomatePlan,
    firstTierMonthlyAutomationPlan,
    firstTierQuarterlyAutomationPlan,
    firstTierYearlyAutomationPlan,
].sort((a, b) => a.amount - b.amount) // Sort to match behaviour in redux selector

export const voiceAvailablePlans = [
    voicePlan1,
    voicePlan2,
    voicePlan2Quarterly,
    voicePlan2Yearly,
    voicePlan2Monthly,
    voicePlan3,
    voicePlan4,
    voicePlan0,
    voicePlan0Quarterly,
    voicePlan0Yearly,
].sort((a, b) => a.amount - b.amount) // Sort to match behaviour in redux selector

export const smsAvailablePlans = [
    smsPlan1,
    smsPlan2,
    smsPlan2Quarterly,
    smsPlan2Yearly,
    smsPlan2Monthly,
    smsPlan3,
    smsPlan4,
    smsPlan0,
    smsPlan0Quarterly,
    smsPlan0Yearly,
].sort((a, b) => a.amount - b.amount) // Sort to match behaviour in redux selector

export const convertAvailablePlans = [
    convertPlan0,
    convertPlan0Quarterly,
    convertPlan0Yearly,
    convertPlan1,
    convertPlan1Quarterly,
    convertPlan1Yearly,
    convertPlan2,
    convertPlan2Quarterly,
    convertPlan2Yearly,
    convertPlan3,
    convertPlan3Quarterly,
    convertPlan3Yearly,
    convertPlan4,
    convertPlan5,
    convertPlan6,
    convertPlan7,
].sort((a, b) => a.amount - b.amount) // Sort to match behaviour in redux selector

export const helpdeskProduct: AvailablePlansOf<ProductType.Helpdesk> = {
    type: ProductType.Helpdesk,
    prices: helpdeskAvailablePlans,
}

export const automationProduct: AvailablePlansOf<ProductType.Automation> = {
    type: ProductType.Automation,
    prices: automationAvailablePlans,
}

export const voiceProduct: AvailablePlansOf<ProductType.Voice> = {
    type: ProductType.Voice,
    prices: voiceAvailablePlans,
}

export const smsProduct: AvailablePlansOf<ProductType.SMS> = {
    type: ProductType.SMS,
    prices: smsAvailablePlans,
}

export const convertProduct: AvailablePlansOf<ProductType.Convert> = {
    type: ProductType.Convert,
    prices: convertAvailablePlans,
}

export const products: AvailablePlansOf<ProductType>[] = [
    helpdeskProduct,
    automationProduct,
    smsProduct,
    voiceProduct,
    convertProduct,
]

export const currentProductsUsage: CurrentProductsUsages = {
    helpdesk: {
        data: {
            extra_tickets_cost_in_cents: 0,
            num_tickets: 2,
            num_extra_tickets: 0,
        },
        meta: {
            subscription_start_datetime: '2017-08-22T00:46:32+00:00',
            subscription_end_datetime: '2017-09-05T00:46:32+00:00',
        },
    },
    automation: {
        data: {
            extra_tickets_cost_in_cents: 0,
            num_tickets: 2,
            num_extra_tickets: 0,
        },
        meta: {
            subscription_start_datetime: '2017-08-22T00:46:32+00:00',
            subscription_end_datetime: '2017-09-05T00:46:32+00:00',
        },
    },
    voice: null,
    sms: null,
    convert: null,
}
