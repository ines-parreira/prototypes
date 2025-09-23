import {
    AutomatePlan,
    AutomatePlanFeatures,
    Cadence,
    ConvertPlan,
    HelpdeskPlan,
    HelpdeskPlanFeatures,
    HelpdeskPlanTier,
    Product,
    ProductType,
    SMSOrVoicePlan,
} from 'models/billing/types'
import { CurrentProductsUsages } from 'state/billing/types'
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
    currency: 'usd',
    extra_ticket_cost: 0.4,
    features: basicHelpdeskPlanFeatures,
    num_quota_tickets: 300,
    integrations: 150,
    is_legacy: false,
    plan_id: 'basic-monthly-usd-4',
    name: 'Basic',
    product: ProductType.Helpdesk,
    price_id: 'price_1LJBjWI9qXomtXqSPZn8LqlD',
    public: true,
    tier: HelpdeskPlanTier.BASIC,
}

export const basicYearlyHelpdeskPlan: HelpdeskPlan = {
    custom: false,
    amount: 60000,
    cadence: Cadence.Year,
    currency: 'usd',
    extra_ticket_cost: 0.4,
    features: basicHelpdeskPlanFeatures,
    num_quota_tickets: 3600,
    integrations: 150,
    is_legacy: false,
    plan_id: 'basic-yearly-usd-4',
    name: 'Basic',
    product: ProductType.Helpdesk,
    price_id: 'price_1LJBjYI9qXomtXqSLEjOrpmV',
    public: true,
    tier: HelpdeskPlanTier.BASIC,
}

export const basicYearlyHelpdeskPlan2: HelpdeskPlan = {
    custom: false,
    amount: 60000,
    cadence: Cadence.Year,
    currency: 'usd',
    extra_ticket_cost: 0.4,
    features: basicHelpdeskPlanFeatures,
    num_quota_tickets: 3600,
    integrations: 150,
    is_legacy: false,
    plan_id: 'basic-yearly-usd-4-2',
    name: 'Basic',
    product: ProductType.Helpdesk,
    price_id: 'price_1LJBjYI9qXomtXqSLEjOrpmV',
    public: true,
    tier: HelpdeskPlanTier.BASIC,
}

export const proMonthlyHelpdeskPlan: HelpdeskPlan = {
    custom: false,
    amount: 36000,
    cadence: Cadence.Month,
    currency: 'usd',
    extra_ticket_cost: 0.36,
    features: proHelpdeskPlanFeatures,
    num_quota_tickets: 2000,
    integrations: 150,
    is_legacy: false,
    plan_id: 'pro-monthly-usd-4',
    name: 'Pro',
    product: ProductType.Helpdesk,
    price_id: 'price_1LJBjaI9qXomtXqSvYfzmmEU',
    public: true,
    tier: HelpdeskPlanTier.PRO,
}

export const proYearlyHelpdeskPlan: HelpdeskPlan = {
    custom: false,
    amount: 360000,
    cadence: Cadence.Year,
    currency: 'usd',
    extra_ticket_cost: 0.36,
    features: proHelpdeskPlanFeatures,
    num_quota_tickets: 24000,
    integrations: 150,
    is_legacy: false,
    plan_id: 'pro-yearly-usd-4',
    name: 'Pro',
    product: ProductType.Helpdesk,
    price_id: 'price_1LJBjbI9qXomtXqShB9YLy7V',
    public: true,
    tier: HelpdeskPlanTier.PRO,
}

export const advancedMonthlyHelpdeskPlan: HelpdeskPlan = {
    custom: false,
    amount: 90000,
    cadence: Cadence.Month,
    currency: 'usd',
    extra_ticket_cost: 0.36,
    features: advancedHelpdeskPlanFeatures,
    num_quota_tickets: 5000,
    integrations: 150,
    is_legacy: false,
    plan_id: 'advanced-monthly-usd-4',
    name: 'Advanced',
    product: ProductType.Helpdesk,
    price_id: 'price_1LJBjdI9qXomtXqS8RzPPA7K',
    public: true,
    tier: HelpdeskPlanTier.ADVANCED,
}

export const advancedYearlyHelpdeskPlan: HelpdeskPlan = {
    custom: false,
    amount: 900000,
    cadence: Cadence.Year,
    currency: 'usd',
    extra_ticket_cost: 0.36,
    features: advancedHelpdeskPlanFeatures,
    num_quota_tickets: 60000,
    integrations: 150,
    is_legacy: false,
    plan_id: 'advanced-yearly-usd-4',
    name: 'Advanced',
    product: ProductType.Helpdesk,
    price_id: 'price_1LJBjfI9qXomtXqSeKJ5lJjD',
    public: true,
    tier: HelpdeskPlanTier.ADVANCED,
}

export const earlyAccessMonthlyAutomationPlan: AutomatePlan = {
    custom: false,
    public: true,
    amount: 3000,
    cadence: Cadence.Month,
    extra_ticket_cost: 0.2,
    num_quota_tickets: 30,
    currency: 'usd',
    features: automatePlanFeatures,
    plan_id: 'aut-free-monthly-usd-6',
    name: 'Early Access',
    product: ProductType.Automation,
    price_id: 'price_1ReIi0I9qXomtXqSUuD5bDGN',
}

export const basicMonthlyAutomationPlan: AutomatePlan = {
    custom: false,
    public: true,
    amount: 3000,
    cadence: Cadence.Month,
    extra_ticket_cost: 0.2,
    num_quota_tickets: 30,
    currency: 'usd',
    features: automatePlanFeatures,
    plan_id: 'aut-addon-basic-full-price-monthly-usd-4',
    name: 'Basic',
    product: ProductType.Automation,
    price_id: 'price_1LJBjXI9qXomtXqSSX34F3we',
}

export const legacyAutomatePlan: AutomatePlan = {
    ...basicMonthlyAutomationPlan,
    public: false,
    amount: basicMonthlyAutomationPlan.amount + 1, // slightly more costly to not rearrange lots of tests just to be undone when removed
    num_quota_tickets: null as unknown as number, // Force the typing to allow null to create this legacy plan
    plan_id: 'free-automation',
    name: 'Legacy Free Automation',
    price_id: 'price_1LYUoGH2GG3UYmlxHnILo5nF',
}

export const firstTierMonthlyAutomationPlan: AutomatePlan = {
    custom: false,
    public: true,
    amount: 3000,
    cadence: Cadence.Month,
    extra_ticket_cost: 1.5,
    num_quota_tickets: 30,
    currency: 'usd',
    generation: 6,
    features: automatePlanFeatures,
    plan_id: 'aut-01-monthly-usd-6',
    name: 'Tier 1',
    product: ProductType.Automation,
    price_id: 'price_1Qs400I9qXomtXqSTWFHnorA',
}

export const basicYearlyAutomationPlan: AutomatePlan = {
    custom: false,
    public: true,
    amount: 30000,
    cadence: Cadence.Year,
    extra_ticket_cost: 0.2,
    num_quota_tickets: 360,
    currency: 'usd',
    features: automatePlanFeatures,
    plan_id: 'aut-addon-basic-full-price-yearly-usd-4',
    name: 'Basic',
    product: ProductType.Automation,
    price_id: 'price_1LJBjZI9qXomtXqSPNgkEZpl',
}

export const proMonthlyAutomationPlan: AutomatePlan = {
    custom: false,
    public: true,
    extra_ticket_cost: 0.18,
    cadence: Cadence.Month,
    num_quota_tickets: 190,
    amount: 18000,
    currency: 'usd',
    features: automatePlanFeatures,
    plan_id: 'aut-addon-pro-full-price-monthly-usd-4',
    name: 'Pro',
    product: ProductType.Automation,
    price_id: 'price_1LJBjbI9qXomtXqS2sfi1J7P',
}

export const proYearlyAutomationPlan: AutomatePlan = {
    custom: false,
    public: true,
    extra_ticket_cost: 0.18,
    num_quota_tickets: 2280,
    cadence: Cadence.Year,
    amount: 180000,
    currency: 'usd',
    features: automatePlanFeatures,
    plan_id: 'aut-addon-pro-full-price-yearly-usd-4',
    name: 'Pro',
    product: ProductType.Automation,
    price_id: 'price_1LJBjdI9qXomtXqSlp9sh6iQ',
}

export const advancedMonthlyAutomatePlan: AutomatePlan = {
    custom: false,
    public: true,
    extra_ticket_cost: 0.18,
    num_quota_tickets: 530,
    cadence: Cadence.Month,
    amount: 45000,
    currency: 'usd',
    features: automatePlanFeatures,
    plan_id: 'aut-addon-advanced-full-price-monthly-usd-4',
    name: 'Advanced',
    product: ProductType.Automation,
    price_id: 'price_1LJBjeI9qXomtXqSXRjmhPsL',
}

export const advancedYearlyAutomatePlan: AutomatePlan = {
    custom: false,
    public: true,
    extra_ticket_cost: 0.18,
    num_quota_tickets: 6360,
    cadence: Cadence.Year,
    amount: 450000,
    currency: 'usd',
    features: automatePlanFeatures,
    plan_id: 'aut-addon-advanced-full-price-yearly-usd-4',
    name: 'Advanced',
    product: ProductType.Automation,
    price_id: 'price_1LJBjgI9qXomtXqSBZoBcg7G',
}

export const automate02MonthlyMeteredPlan: AutomatePlan = {
    name: 'Automation 02 monthly usd-5',
    amount: 180_00,
    num_quota_tickets: 190,
    currency: 'usd',
    cadence: Cadence.Month,
    extra_ticket_cost: 1.9,
    public: true,
    generation: 5,
    custom: false,
    plan_id: 'aut-02-monthly-usd-5',
    features: automatePlanFeatures,
    product: ProductType.Automation,
    price_id: 'price_1NDljFI9qXomtXqSLfW8eTwt',
}

export const automate05YearlyMeteredPlan: AutomatePlan = {
    name: 'Automation 05 yearly usd-5',
    amount: 15000_00,
    num_quota_tickets: 24_000,
    currency: 'usd',
    cadence: Cadence.Year,
    extra_ticket_cost: 1.25,
    public: true,
    custom: false,
    plan_id: 'aut-05-yearly-usd-5',
    features: automatePlanFeatures,
    product: ProductType.Automation,
    price_id: 'price_1NDljoI9qXomtXqSABPGJ8si',
}
export const legacyBasicHelpdeskPlan: HelpdeskPlan = {
    custom: false,
    amount: 6000,
    cadence: Cadence.Month,
    extra_ticket_cost: 0.06,
    currency: 'usd',
    features: basicHelpdeskPlanFeatures,
    num_quota_tickets: 600,
    integrations: 7,
    is_legacy: true,
    plan_id: 'basic-usd-1',
    name: 'Basic Plan',
    product: ProductType.Helpdesk,
    price_id: 'price_1LJBlXI9qXomtXqSddDEgsDA',
    public: false,
    tier: HelpdeskPlanTier.BASIC,
}

export const customHelpdeskPlan: HelpdeskPlan = {
    amount: 160000,
    extra_ticket_cost: 0.32,
    cadence: Cadence.Month,
    currency: 'usd',
    custom: true,
    features: customHelpdeskPlanFeatures,
    num_quota_tickets: 10000,
    integrations: 150,
    is_legacy: false,
    plan_id: 'custom-monthly-usd-4-1',
    name: 'Custom',
    product: ProductType.Helpdesk,
    price_id: 'price_1LJBjhI9qXomtXqSAUwsyU2z',
    public: true,
    tier: HelpdeskPlanTier.CUSTOM,
}

export const starterHelpdeskPlan: HelpdeskPlan = {
    custom: false,
    amount: 1000,
    extra_ticket_cost: 0.4,
    cadence: Cadence.Month,
    currency: 'usd',
    features: starterHelpdeskPlanFeatures,
    num_quota_tickets: 50,
    integrations: 150,
    is_legacy: false,
    plan_id: 'starter-monthly-usd-4',
    name: 'Starter',
    product: ProductType.Helpdesk,
    price_id: 'price_1LVt4TI9qXomtXqSeHydKB9S',
    public: false,
    tier: HelpdeskPlanTier.STARTER,
}

export const voicePlan0: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 0,
    cadence: Cadence.Month,
    currency: 'usd',
    num_quota_tickets: 0,
    plan_id: 'voc-addon-00-monthly-usd-4',
    name: 'Voice Addon Trial Monthly',
    price_id: 'price_1LkClqI9qXomtXqSlgYCG6Wm',
    product: ProductType.Voice,
    extra_ticket_cost: 2.4,
}

export const voicePlan1: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 175,
    cadence: Cadence.Month,
    currency: 'usd',
    num_quota_tickets: 250,
    plan_id: 'voc-addon-04-monthly-usd-4',
    name: 'Voice Addon 250 Monthly',
    price_id: 'price_1LkAzlI9qXomtXqSxOOrhzcU',
    product: ProductType.Voice,
    extra_ticket_cost: 1.4,
}

const voicePlan2: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 1750,
    cadence: Cadence.Month,
    currency: 'usd',
    num_quota_tickets: 7500,
    plan_id: 'voc-addon-10-monthly-usd-4',
    name: 'Voice Addon 7500 Monthly',
    price_id: 'price_1LkB44I9qXomtXqS4aF9ibna',
    product: ProductType.Voice,
    extra_ticket_cost: 0.47,
}

export const voicePlan3: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 3000,
    cadence: Cadence.Year,
    currency: 'usd',
    num_quota_tickets: 300,
    plan_id: 'voice-01-yearly-usd-5',
    name: 'Voice Addon 300 Yearly',
    price_id: 'price_1O9TX8I9qXomtXqSR9drzVqz',
    product: ProductType.Voice,
    extra_ticket_cost: 2.2,
}

export const monthlyVoicePlan: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 300,
    cadence: Cadence.Month,
    currency: 'usd',
    num_quota_tickets: 30,
    plan_id: 'voice-01-monthly-usd-5',
    name: 'Voice Addon 300 Yearly',
    price_id: 'price_1O9TX8I9qXomtXqSR9drzVqz',
    product: ProductType.Voice,
    extra_ticket_cost: 2.2,
}

export const smsPlan1: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 90,
    cadence: Cadence.Month,
    currency: 'usd',
    num_quota_tickets: 150,
    plan_id: 'sms-addon-03-monthly-usd-4',
    name: 'SMS Addon 150 Monthly',
    price_id: 'price_1LkBzKI9qXomtXqSEXrSV8o4',
    product: ProductType.SMS,
    extra_ticket_cost: 1.2,
}

const smsPlan2: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 5768,
    cadence: Cadence.Month,
    currency: 'usd',
    num_quota_tickets: 15000,
    plan_id: 'sms-addon-12-monthly-usd-4',
    name: 'SMS Addon 15000 Monthly',
    price_id: 'price_1LkBzLI9qXomtXqSgzXlOnP4',
    product: ProductType.SMS,
    extra_ticket_cost: 0.77,
}

export const smsPlan3: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 200,
    cadence: Cadence.Year,
    currency: 'usd',
    num_quota_tickets: 300,
    plan_id: 'sms-01-yearly-usd-5',
    name: 'SMS Addon 300 Yearly',
    price_id: 'price_1O9Vc7I9qXomtXqS4a8p3S7e',
    product: ProductType.SMS,
    extra_ticket_cost: 1.5,
}

export const monthlySmsPlan: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 20,
    cadence: Cadence.Month,
    currency: 'usd',
    num_quota_tickets: 30,
    plan_id: 'sms-01-monthly-usd-5',
    name: 'SMS Addon 300 Yearly',
    price_id: 'price_1O9Vc7I9qXomtXqS4a8p3S7e',
    product: ProductType.SMS,
    extra_ticket_cost: 1.5,
}

export const smsPlan0: SMSOrVoicePlan = {
    custom: false,
    public: true,
    amount: 0,
    cadence: Cadence.Month,
    currency: 'usd',
    num_quota_tickets: 0,
    plan_id: 'sms-addon-00-monthly-usd-4',
    name: 'SMS Addon Trial Monthly',
    price_id: 'price_1M6V7uI9qXomtXqSpsoVQWUw',
    product: ProductType.SMS,
    extra_ticket_cost: 1.6,
}

export const convertPlan0: ConvertPlan = {
    custom: false,
    public: true,
    amount: 0,
    cadence: Cadence.Month,
    currency: 'usd',
    num_quota_tickets: 0,
    plan_id: 'convert-00-monthly-usd-5',
    name: 'Convert Trial Monthly',
    price_id: 'price_1NdBfmI9qXomtXqSFfC7T2xX',
    product: ProductType.Convert,
    extra_ticket_cost: 1,
    tier: 0,
}

export const convertPlan1: ConvertPlan = {
    custom: false,
    public: true,
    amount: 3000,
    cadence: Cadence.Month,
    currency: 'usd',
    num_quota_tickets: 50,
    plan_id: 'convert-01-monthly-usd-5',
    name: 'Convert 50 Monthly',
    price_id: 'price_1NdBiMI9qXomtXqSX8MxFkYW',
    product: ProductType.Convert,
    extra_ticket_cost: 0,
    tier: 1,
}

export const convertPlan2: ConvertPlan = {
    custom: false,
    public: true,
    amount: 25000,
    cadence: Cadence.Month,
    currency: 'usd',
    num_quota_tickets: 500,
    plan_id: 'convert-02-monthly-usd-5',
    name: 'Convert 500 Monthly',
    price_id: 'price_1NdXfXI9qXomtXqS0CDMe7Yy',
    product: ProductType.Convert,
    extra_ticket_cost: 0,
    tier: 2,
}

export const convertPlan3: ConvertPlan = {
    custom: false,
    public: true,
    amount: 80000,
    cadence: Cadence.Month,
    currency: 'usd',
    num_quota_tickets: 2000,
    plan_id: 'convert-03-monthly-usd-5',
    name: 'Convert 2,000 Monthly',
    price_id: 'price_1NmZrmH2GG3UYmlxBGfOOSLS',
    product: ProductType.Convert,
    extra_ticket_cost: 0,
    tier: 3,
}

export const convertPlan4: ConvertPlan = {
    custom: false,
    public: true,
    amount: 110000,
    cadence: Cadence.Month,
    currency: 'usd',
    num_quota_tickets: 2000,
    plan_id: 'convert-04-monthly-usd-6',
    name: 'Convert 2,000 Monthly',
    price_id: 'price_1NmZrmH2GG3UYmlxBGfOOSL2',
    product: ProductType.Convert,
    extra_ticket_cost: 0,
    tier: 4,
}

export const convertPlan5: ConvertPlan = {
    custom: false,
    public: true,
    amount: 157500,
    cadence: Cadence.Month,
    currency: 'usd',
    num_quota_tickets: 3000,
    plan_id: 'convert-05-monthly-usd-6',
    name: 'Convert 3,000 Monthly',
    price_id: 'price_1NmZrmH2GG3UYmlxBGfOOSL1',
    product: ProductType.Convert,
    extra_ticket_cost: 0,
    tier: 5,
}

export const convertPlan6: ConvertPlan = {
    custom: false,
    public: true,
    amount: 36000,
    cadence: Cadence.Year,
    currency: 'usd',
    num_quota_tickets: 600,
    plan_id: 'convert-01-yearly-usd-6',
    name: 'Convert 600 Yearly',
    price_id: 'price_2NmZrmH2GG3UYmlxBGfOOSL1',
    product: ProductType.Convert,
    extra_ticket_cost: 0,
    tier: 1,
}

export const monthlyConvertPlan: ConvertPlan = {
    custom: false,
    public: true,
    amount: 3600,
    cadence: Cadence.Month,
    currency: 'usd',
    num_quota_tickets: 60,
    plan_id: 'convert-01-monthly-usd-6',
    name: 'Convert 600 Yearly',
    price_id: 'price_2NmZrmH2GG3UYmlxBGfOOSL1',
    product: ProductType.Convert,
    extra_ticket_cost: 0,
    tier: 1,
}

export const HELPDESK_PRODUCT_ID = 'prod_LsH6kV35G6zKWo'
export const AUTOMATION_PRODUCT_ID = 'prod_LsHD5xmSqoFBBs'
export const VOICE_PRODUCT_ID = 'prod_MT6fyh00TCFRGZ'
export const SMS_PRODUCT_ID = 'prod_MT8Fzk7vmcT73m'
export const CONVERT_PRODUCT_ID = 'prod_Mwy3exdalDFouZ'

export const helpdeskProduct: Product<ProductType.Helpdesk> = {
    id: HELPDESK_PRODUCT_ID,
    type: ProductType.Helpdesk,
    prices: [
        starterHelpdeskPlan,
        basicMonthlyHelpdeskPlan,
        basicYearlyHelpdeskPlan,
        proMonthlyHelpdeskPlan,
        proYearlyHelpdeskPlan,
        advancedMonthlyHelpdeskPlan,
        advancedYearlyHelpdeskPlan,
    ],
}

export const automationProduct: Product<ProductType.Automation> = {
    id: AUTOMATION_PRODUCT_ID,
    type: ProductType.Automation,
    prices: [
        legacyAutomatePlan,
        basicMonthlyAutomationPlan,
        basicYearlyAutomationPlan,
        proMonthlyAutomationPlan,
        proYearlyAutomationPlan,
        advancedMonthlyAutomatePlan,
        advancedYearlyAutomatePlan,
        firstTierMonthlyAutomationPlan,
    ],
}

export const voiceAvailablePlans = [
    voicePlan1,
    voicePlan2,
    voicePlan3,
    voicePlan0,
]

export const smsAvailablePlans = [smsPlan1, smsPlan2, smsPlan3, smsPlan0]

export const convertAvailablePlans = [
    convertPlan0,
    convertPlan1,
    convertPlan2,
    convertPlan3,
    convertPlan4,
    convertPlan5,
    convertPlan6,
]

export const voiceProduct: Product<ProductType.Voice> = {
    id: VOICE_PRODUCT_ID,
    type: ProductType.Voice,
    prices: voiceAvailablePlans,
}

export const smsProduct: Product<ProductType.SMS> = {
    id: SMS_PRODUCT_ID,
    type: ProductType.SMS,
    prices: smsAvailablePlans,
}

export const convertProduct: Product<ProductType.Convert> = {
    id: CONVERT_PRODUCT_ID,
    type: ProductType.Convert,
    prices: convertAvailablePlans,
}

export const products: Product<ProductType>[] = [
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
