import {AccountFeature} from 'state/currentAccount/types'
import {
    AutomationPrice,
    AutomationPriceFeatures,
    ConvertPrice,
    HelpdeskPrice,
    HelpdeskPriceFeatures,
    PlanInterval,
    Product,
    ProductType,
    SMSOrVoicePrice,
} from 'models/billing/types'
import {CurrentProductsUsages} from 'state/billing/types'

export const basicHelpdeskPriceFeatures: HelpdeskPriceFeatures = {
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
    [AccountFeature.AutoAssignment]: {enabled: true},
    [AccountFeature.FacebookComment]: {enabled: true},
    [AccountFeature.InstagramComment]: {enabled: true},
    [AccountFeature.InstagramDirectMessage]: {enabled: true},
    [AccountFeature.OverviewLiveStatistics]: {enabled: true},
    [AccountFeature.UsersLiveStatistics]: {enabled: false},
    [AccountFeature.MagentoIntegration]: {enabled: false},
    [AccountFeature.PhoneNumber]: {enabled: true, limit: 1},
    [AccountFeature.TwitterIntegration]: {enabled: false, limit: 0},
    [AccountFeature.YotpoIntegration]: {enabled: true},
    [AccountFeature.RevenueStatistics]: {enabled: false},
    [AccountFeature.SatisfactionSurveys]: {enabled: true},
    [AccountFeature.Teams]: {enabled: true},
    [AccountFeature.UserRoles]: {enabled: true},
    [AccountFeature.ViewSharing]: {enabled: true},
    [AccountFeature.HelpCenter]: {enabled: true},
    [AccountFeature.AutomationManagedRules]: {enabled: false},
    [AccountFeature.AutomationTrackOrderFlow]: {enabled: false},
    [AccountFeature.AutomationReportIssueFlow]: {enabled: false},
    [AccountFeature.AutomationCancellationsFlow]: {enabled: false},
    [AccountFeature.AutomationReturnFlow]: {enabled: false},
    [AccountFeature.AutomationSelfServiceStatistics]: {enabled: false},
    [AccountFeature.AutomationAddonOverview]: {enabled: false},
}

export const automationPriceFeatures: AutomationPriceFeatures = {
    [AccountFeature.AutomationManagedRules]: {enabled: true},
    [AccountFeature.AutomationTrackOrderFlow]: {enabled: true},
    [AccountFeature.AutomationReportIssueFlow]: {enabled: true},
    [AccountFeature.AutomationCancellationsFlow]: {enabled: true},
    [AccountFeature.AutomationReturnFlow]: {enabled: true},
    [AccountFeature.AutomationSelfServiceStatistics]: {enabled: true},
}

export const legacyAutomationPriceFeatures: AutomationPriceFeatures = {
    [AccountFeature.AutomationManagedRules]: {enabled: false},
    [AccountFeature.AutomationTrackOrderFlow]: {enabled: true},
    [AccountFeature.AutomationReportIssueFlow]: {enabled: true},
    [AccountFeature.AutomationCancellationsFlow]: {enabled: true},
    [AccountFeature.AutomationReturnFlow]: {enabled: true},
    [AccountFeature.AutomationSelfServiceStatistics]: {enabled: false},
}

const proHelpdeskPriceFeatures: HelpdeskPriceFeatures = {
    [AccountFeature.Api1stPartyRateLimit]: {
        enabled: true,
        rate_limit: {interval_ms: 2000, max_burst: 40},
    },
    [AccountFeature.Api3rdPartyRateLimit]: {
        enabled: true,
        rate_limit: {interval_ms: 20000, max_burst: 40},
    },
    [AccountFeature.AutoAssignment]: {enabled: true},
    [AccountFeature.FacebookComment]: {enabled: true},
    [AccountFeature.InstagramComment]: {enabled: true},
    [AccountFeature.InstagramDirectMessage]: {enabled: true},
    [AccountFeature.UsersLiveStatistics]: {enabled: true},
    [AccountFeature.OverviewLiveStatistics]: {enabled: true},
    [AccountFeature.MagentoIntegration]: {enabled: true},
    [AccountFeature.PhoneNumber]: {enabled: true, limit: 3},
    [AccountFeature.TwitterIntegration]: {enabled: false, limit: 0},
    [AccountFeature.YotpoIntegration]: {enabled: true},
    [AccountFeature.RevenueStatistics]: {enabled: true},
    [AccountFeature.SatisfactionSurveys]: {enabled: true},
    [AccountFeature.Teams]: {enabled: true},
    [AccountFeature.UserRoles]: {enabled: true},
    [AccountFeature.ViewSharing]: {enabled: true},
    [AccountFeature.HelpCenter]: {enabled: true},
    [AccountFeature.AutomationManagedRules]: {enabled: false},
    [AccountFeature.AutomationTrackOrderFlow]: {enabled: false},
    [AccountFeature.AutomationReportIssueFlow]: {enabled: false},
    [AccountFeature.AutomationCancellationsFlow]: {enabled: false},
    [AccountFeature.AutomationReturnFlow]: {enabled: false},
    [AccountFeature.AutomationSelfServiceStatistics]: {enabled: false},
    [AccountFeature.AutomationAddonOverview]: {enabled: false},
}

const advancedHelpdeskPriceFeatures: HelpdeskPriceFeatures = {
    [AccountFeature.Api1stPartyRateLimit]: {
        enabled: true,
        rate_limit: {interval_ms: 2000, max_burst: 40},
    },
    [AccountFeature.Api3rdPartyRateLimit]: {
        enabled: true,
        rate_limit: {interval_ms: 20000, max_burst: 40},
    },
    [AccountFeature.AutoAssignment]: {enabled: true},
    [AccountFeature.FacebookComment]: {enabled: true},
    [AccountFeature.InstagramComment]: {enabled: true},
    [AccountFeature.InstagramDirectMessage]: {enabled: true},
    [AccountFeature.UsersLiveStatistics]: {enabled: true},
    [AccountFeature.OverviewLiveStatistics]: {enabled: true},
    [AccountFeature.MagentoIntegration]: {enabled: true},
    [AccountFeature.PhoneNumber]: {enabled: true, limit: 10},
    [AccountFeature.TwitterIntegration]: {enabled: true, limit: 2},
    [AccountFeature.YotpoIntegration]: {enabled: true},
    [AccountFeature.RevenueStatistics]: {enabled: true},
    [AccountFeature.SatisfactionSurveys]: {enabled: true},
    [AccountFeature.Teams]: {enabled: true},
    [AccountFeature.UserRoles]: {enabled: true},
    [AccountFeature.ViewSharing]: {enabled: true},
    [AccountFeature.HelpCenter]: {enabled: true},
    [AccountFeature.AutomationManagedRules]: {enabled: false},
    [AccountFeature.AutomationTrackOrderFlow]: {enabled: false},
    [AccountFeature.AutomationReportIssueFlow]: {enabled: false},
    [AccountFeature.AutomationCancellationsFlow]: {enabled: false},
    [AccountFeature.AutomationReturnFlow]: {enabled: false},
    [AccountFeature.AutomationSelfServiceStatistics]: {enabled: false},
    [AccountFeature.AutomationAddonOverview]: {enabled: false},
}

const customHelpdeskPriceFeatures: HelpdeskPriceFeatures = {
    [AccountFeature.Api1stPartyRateLimit]: {
        enabled: true,
        rate_limit: {interval_ms: 4000, max_burst: 200},
    },
    [AccountFeature.Api3rdPartyRateLimit]: {
        enabled: true,
        rate_limit: {interval_ms: 10000, max_burst: 40},
    },
    [AccountFeature.AutoAssignment]: {enabled: true},
    [AccountFeature.FacebookComment]: {enabled: true},
    [AccountFeature.InstagramComment]: {enabled: true},
    [AccountFeature.InstagramDirectMessage]: {enabled: true},
    [AccountFeature.UsersLiveStatistics]: {enabled: true},
    [AccountFeature.OverviewLiveStatistics]: {enabled: true},
    [AccountFeature.MagentoIntegration]: {enabled: true},
    [AccountFeature.PhoneNumber]: {enabled: true, limit: 150},
    [AccountFeature.TwitterIntegration]: {enabled: true, limit: 10},
    [AccountFeature.YotpoIntegration]: {enabled: true},
    [AccountFeature.RevenueStatistics]: {enabled: true},
    [AccountFeature.SatisfactionSurveys]: {enabled: true},
    [AccountFeature.Teams]: {enabled: true},
    [AccountFeature.UserRoles]: {enabled: true},
    [AccountFeature.ViewSharing]: {enabled: true},
    [AccountFeature.HelpCenter]: {enabled: true},
    [AccountFeature.AutomationManagedRules]: {enabled: false},
    [AccountFeature.AutomationTrackOrderFlow]: {enabled: false},
    [AccountFeature.AutomationReportIssueFlow]: {enabled: false},
    [AccountFeature.AutomationCancellationsFlow]: {enabled: false},
    [AccountFeature.AutomationReturnFlow]: {enabled: false},
    [AccountFeature.AutomationSelfServiceStatistics]: {enabled: false},
    [AccountFeature.AutomationAddonOverview]: {enabled: false},
}

export const starterHelpdeskPriceFeatures: HelpdeskPriceFeatures = {
    [AccountFeature.Api1stPartyRateLimit]: {
        enabled: true,
        rate_limit: {interval_ms: 2000, max_burst: 40},
    },
    [AccountFeature.Api3rdPartyRateLimit]: {
        enabled: true,
        rate_limit: {interval_ms: 20000, max_burst: 40},
    },
    [AccountFeature.AutoAssignment]: {enabled: true},
    [AccountFeature.FacebookComment]: {enabled: true},
    [AccountFeature.InstagramComment]: {enabled: true},
    [AccountFeature.InstagramDirectMessage]: {enabled: true},
    [AccountFeature.OverviewLiveStatistics]: {enabled: false},
    [AccountFeature.UsersLiveStatistics]: {enabled: false},
    [AccountFeature.MagentoIntegration]: {enabled: false},
    [AccountFeature.PhoneNumber]: {enabled: false, limit: 0},
    [AccountFeature.TwitterIntegration]: {enabled: false, limit: 0},
    [AccountFeature.YotpoIntegration]: {enabled: true},
    [AccountFeature.RevenueStatistics]: {enabled: false},
    [AccountFeature.SatisfactionSurveys]: {enabled: true},
    [AccountFeature.Teams]: {enabled: true},
    [AccountFeature.UserRoles]: {enabled: true},
    [AccountFeature.ViewSharing]: {enabled: true},
    [AccountFeature.HelpCenter]: {enabled: true},
    [AccountFeature.AutomationManagedRules]: {enabled: false},
    [AccountFeature.AutomationTrackOrderFlow]: {enabled: false},
    [AccountFeature.AutomationReportIssueFlow]: {enabled: false},
    [AccountFeature.AutomationCancellationsFlow]: {enabled: false},
    [AccountFeature.AutomationReturnFlow]: {enabled: false},
    [AccountFeature.AutomationSelfServiceStatistics]: {enabled: false},
    [AccountFeature.AutomationAddonOverview]: {enabled: false},
}

export const basicMonthlyHelpdeskPrice: HelpdeskPrice = {
    addons: ['price_1LJBjXI9qXomtXqSSX34F3we'],
    amount: 6000,
    extra_ticket_cost: 0.4,
    currency: 'usd',
    features: basicHelpdeskPriceFeatures,
    num_quota_tickets: 300,
    integrations: 150,
    interval: PlanInterval.Month,
    is_legacy: false,
    legacy_id: 'basic-monthly-usd-4',
    internal_id: 'basic-monthly-usd-4',
    limits: {
        messages: {
            default: 100,
            max: 100,
            min: 75,
        },
        tickets: {
            default: 100,
            max: 100,
            min: 75,
        },
    },
    name: 'Basic',
    order: 2,
    phone_limits: {
        billing: 50,
    },
    product_id: 'prod_LsH6kV35G6zKWo',
    price_id: 'price_1LJBjWI9qXomtXqSPZn8LqlD',
    public: true,
    trial_period_days: 7,
}

export const basicYearlyHelpdeskPrice: HelpdeskPrice = {
    addons: ['price_1LJBjZI9qXomtXqSPNgkEZpl'],
    amount: 60000,
    extra_ticket_cost: 0.4,
    currency: 'usd',
    features: basicHelpdeskPriceFeatures,
    num_quota_tickets: 3600,
    integrations: 150,
    interval: PlanInterval.Year,
    is_legacy: false,
    legacy_id: 'basic-yearly-usd-4',
    internal_id: 'basic-yearly-usd-4',
    limits: {
        messages: {
            default: 100,
            max: 100,
            min: 75,
        },
        tickets: {
            default: 100,
            max: 100,
            min: 75,
        },
    },
    name: 'Basic',
    order: 2,
    phone_limits: {
        billing: 50,
    },
    product_id: 'prod_LsH6kV35G6zKWo',
    price_id: 'price_1LJBjYI9qXomtXqSLEjOrpmV',
    public: true,
    trial_period_days: 7,
}

export const proMonthlyHelpdeskPrice: HelpdeskPrice = {
    addons: ['price_1LJBjbI9qXomtXqS2sfi1J7P'],
    amount: 36000,
    extra_ticket_cost: 0.36,
    currency: 'usd',
    features: proHelpdeskPriceFeatures,
    num_quota_tickets: 2000,
    integrations: 150,
    interval: PlanInterval.Month,
    is_legacy: false,
    legacy_id: 'pro-monthly-usd-4',
    internal_id: 'pro-monthly-usd-4',
    limits: {
        messages: {
            default: 100,
            max: 100,
            min: 75,
        },
        tickets: {
            default: 100,
            max: 100,
            min: 75,
        },
    },
    name: 'Pro',
    order: 3,
    phone_limits: {
        billing: 200,
    },
    product_id: 'prod_LsH6kV35G6zKWo',
    price_id: 'price_1LJBjaI9qXomtXqSvYfzmmEU',
    public: true,
    trial_period_days: 7,
}

export const proYearlyHelpdeskPrice: HelpdeskPrice = {
    addons: ['price_1LJBjdI9qXomtXqSlp9sh6iQ'],
    amount: 360000,
    extra_ticket_cost: 0.36,
    currency: 'usd',
    features: proHelpdeskPriceFeatures,
    num_quota_tickets: 24000,
    integrations: 150,
    interval: PlanInterval.Year,
    is_legacy: false,
    legacy_id: 'pro-yearly-usd-4',
    internal_id: 'pro-yearly-usd-4',
    limits: {
        messages: {
            default: 100,
            max: 100,
            min: 75,
        },
        tickets: {
            default: 100,
            max: 100,
            min: 75,
        },
    },
    name: 'Pro',
    order: 3,
    phone_limits: {
        billing: 200,
    },
    product_id: 'prod_LsH6kV35G6zKWo',
    price_id: 'price_1LJBjbI9qXomtXqShB9YLy7V',
    public: true,
    trial_period_days: 7,
}

export const advancedMonthlyHelpdeskPrice: HelpdeskPrice = {
    addons: ['price_1LJBjeI9qXomtXqSXRjmhPsL'],
    amount: 90000,
    extra_ticket_cost: 0.36,
    currency: 'usd',
    features: advancedHelpdeskPriceFeatures,
    num_quota_tickets: 5000,
    integrations: 150,
    interval: PlanInterval.Month,
    is_legacy: false,
    legacy_id: 'advanced-monthly-usd-4',
    internal_id: 'advanced-monthly-usd-4',
    limits: {
        messages: {
            default: 100,
            max: 100,
            min: 75,
        },
        tickets: {
            default: 100,
            max: 100,
            min: 75,
        },
    },
    name: 'Advanced',
    order: 4,
    phone_limits: {
        billing: 750,
    },
    product_id: 'prod_LsH6kV35G6zKWo',
    price_id: 'price_1LJBjdI9qXomtXqS8RzPPA7K',
    public: true,
    trial_period_days: 7,
}

export const advancedYearlyHelpdeskPrice: HelpdeskPrice = {
    addons: ['price_1LJBjgI9qXomtXqSBZoBcg7G'],
    amount: 900000,
    extra_ticket_cost: 0.36,
    currency: 'usd',
    features: advancedHelpdeskPriceFeatures,
    num_quota_tickets: 60000,
    integrations: 150,
    interval: PlanInterval.Year,
    is_legacy: false,
    legacy_id: 'advanced-yearly-usd-4',
    internal_id: 'advanced-yearly-usd-4',
    limits: {
        messages: {
            default: 100,
            max: 100,
            min: 75,
        },
        tickets: {
            default: 100,
            max: 100,
            min: 75,
        },
    },
    name: 'Advanced',
    order: 4,
    phone_limits: {
        billing: 750,
    },
    product_id: 'prod_LsH6kV35G6zKWo',
    price_id: 'price_1LJBjfI9qXomtXqSeKJ5lJjD',
    public: true,
    trial_period_days: 7,
}

export const basicMonthlyAutomationPrice: AutomationPrice = {
    amount: 3000,
    extra_ticket_cost: 0.2,
    num_quota_tickets: 30,
    automation_addon_discount: 0,
    automation_addon_included: true,
    base_price_id: 'price_1LJBjWI9qXomtXqSPZn8LqlD',
    currency: 'usd',
    features: automationPriceFeatures,
    interval: PlanInterval.Month,
    legacy_id: 'basic-automation-full-price-monthly-usd-4',
    internal_id: 'aut-addon-basic-full-price-monthly-usd-4',
    name: 'Basic',
    order: 2,
    product_id: 'prod_LsHD5xmSqoFBBs',
    price_id: 'price_1LJBjXI9qXomtXqSSX34F3we',
}

export const basicYearlyAutomationPrice: AutomationPrice = {
    amount: 30000,
    extra_ticket_cost: 0.2,
    num_quota_tickets: 360,
    automation_addon_discount: 0,
    automation_addon_included: true,
    base_price_id: 'price_1LJBjYI9qXomtXqSLEjOrpmV',
    currency: 'usd',
    features: automationPriceFeatures,
    interval: PlanInterval.Year,
    legacy_id: 'basic-automation-full-price-yearly-usd-4',
    internal_id: 'aut-addon-basic-full-price-yearly-usd-4',
    name: 'Basic',
    order: 2,
    product_id: 'prod_LsHD5xmSqoFBBs',
    price_id: 'price_1LJBjZI9qXomtXqSPNgkEZpl',
}

export const proMonthlyAutomationPrice: AutomationPrice = {
    extra_ticket_cost: 0.18,
    num_quota_tickets: 190,
    amount: 18000,
    automation_addon_discount: 0,
    automation_addon_included: true,
    base_price_id: 'price_1LJBjaI9qXomtXqSvYfzmmEU',
    currency: 'usd',
    features: automationPriceFeatures,
    interval: PlanInterval.Month,
    legacy_id: 'pro-automation-full-price-monthly-usd-4',
    internal_id: 'aut-addon-pro-full-price-monthly-usd-4',
    name: 'Pro',
    order: 3,
    product_id: 'prod_LsHD5xmSqoFBBs',
    price_id: 'price_1LJBjbI9qXomtXqS2sfi1J7P',
}

export const proYearlyAutomationPrice: AutomationPrice = {
    extra_ticket_cost: 0.18,
    num_quota_tickets: 2280,
    amount: 180000,
    automation_addon_discount: 0,
    automation_addon_included: true,
    base_price_id: 'price_1LJBjbI9qXomtXqShB9YLy7V',
    currency: 'usd',
    features: automationPriceFeatures,
    interval: PlanInterval.Year,
    legacy_id: 'pro-automation-full-price-yearly-usd-4',
    internal_id: 'aut-addon-pro-full-price-yearly-usd-4',
    name: 'Pro',
    order: 3,
    product_id: 'prod_LsHD5xmSqoFBBs',
    price_id: 'price_1LJBjdI9qXomtXqSlp9sh6iQ',
}

export const advancedMonthlyAutomationPrice: AutomationPrice = {
    extra_ticket_cost: 0.18,
    num_quota_tickets: 530,
    amount: 45000,
    automation_addon_discount: 0,
    automation_addon_included: true,
    base_price_id: 'price_1LJBjdI9qXomtXqS8RzPPA7K',
    currency: 'usd',
    features: automationPriceFeatures,
    interval: PlanInterval.Month,
    legacy_id: 'advanced-automation-full-price-monthly-usd-4',
    internal_id: 'aut-addon-advanced-full-price-monthly-usd-4',
    name: 'Advanced',
    order: 4,
    product_id: 'prod_LsHD5xmSqoFBBs',
    price_id: 'price_1LJBjeI9qXomtXqSXRjmhPsL',
}

export const advancedYearlyAutomationPrice: AutomationPrice = {
    extra_ticket_cost: 0.18,
    num_quota_tickets: 6360,
    amount: 450000,
    automation_addon_discount: 0,
    automation_addon_included: true,
    base_price_id: 'price_1LJBjfI9qXomtXqSeKJ5lJjD',
    currency: 'usd',
    features: automationPriceFeatures,
    interval: PlanInterval.Year,
    legacy_id: 'advanced-automation-full-price-yearly-usd-4',
    internal_id: 'aut-addon-advanced-full-price-yearly-usd-4',
    name: 'Advanced',
    order: 4,
    product_id: 'prod_LsHD5xmSqoFBBs',
    price_id: 'price_1LJBjgI9qXomtXqSBZoBcg7G',
}

export const legacyBasicHelpdeskPrice: HelpdeskPrice = {
    addons: ['price_1LJBlbI9qXomtXqSvvtgyZ1z'],
    amount: 6000,
    extra_ticket_cost: 0.06,
    currency: 'usd',
    features: basicHelpdeskPriceFeatures,
    legacy_automation_addon_features: legacyAutomationPriceFeatures,
    num_quota_tickets: 600,
    integrations: 7,
    interval: PlanInterval.Month,
    is_legacy: true,
    legacy_id: 'basic-usd-1',
    internal_id: 'basic-usd-1',
    limits: {
        messages: {
            default: 100,
            max: 100,
            min: 75,
        },
        tickets: {
            default: 100,
            max: 100,
            min: 75,
        },
    },
    name: 'Basic Plan',
    phone_limits: {
        billing: 50,
    },
    product_id: 'prod_LsH6kV35G6zKWo',
    price_id: 'price_1LJBlXI9qXomtXqSddDEgsDA',
    public: false,
    trial_period_days: 7,
}

export const legacyBasicAutomationPrice: AutomationPrice = {
    extra_ticket_cost: 0,
    num_quota_tickets: null,
    amount: 1500,
    automation_addon_discount: 0.5,
    automation_addon_included: true,
    base_price_id: 'price_1LJBlXI9qXomtXqSddDEgsDA',
    currency: 'usd',
    features: automationPriceFeatures,
    interval: PlanInterval.Month,
    legacy_id: 'basic-automation-usd-1',
    internal_id: 'basic-automation-usd-1',
    name: 'Basic Plan',
    product_id: 'prod_LsHD5xmSqoFBBs',
    price_id: 'price_1LJBlbI9qXomtXqSvvtgyZ1z',
}

export const customHelpdeskPrice: HelpdeskPrice = {
    addons: ['price_1LJBjiI9qXomtXqSvQBcRw5V'],
    amount: 160000,
    extra_ticket_cost: 0.32,
    currency: 'usd',
    custom: true,
    features: customHelpdeskPriceFeatures,
    num_quota_tickets: 10000,
    integrations: 150,
    interval: PlanInterval.Month,
    is_legacy: false,
    legacy_id: 'custom-monthly-usd-4-1',
    internal_id: 'custom-monthly-usd-4-1',
    limits: {
        messages: {
            default: 100,
            max: 100,
            min: 75,
        },
        tickets: {
            default: 100,
            max: 100,
            min: 75,
        },
    },
    name: 'Custom',
    phone_limits: {
        billing: 2000,
    },
    product_id: 'prod_LsH6kV35G6zKWo',
    price_id: 'price_1LJBjhI9qXomtXqSAUwsyU2z',
    public: true,
    trial_period_days: 7,
}

export const customAutomationPrice: AutomationPrice = {
    extra_ticket_cost: 0.16,
    num_quota_tickets: null,
    amount: 80000,
    automation_addon_discount: 0,
    automation_addon_included: true,
    base_price_id: 'price_1LJBjhI9qXomtXqSAUwsyU2z',
    currency: 'usd',
    features: automationPriceFeatures,
    interval: PlanInterval.Month,
    legacy_id: 'custom-automation-full-price-monthly-usd-4-1',
    internal_id: 'aut-addon-custom-full-price-monthly-usd-4-1',
    name: 'Custom',
    product_id: 'prod_LsHD5xmSqoFBBs',
    price_id: 'price_1LJBjiI9qXomtXqSvQBcRw5V',
}

export const basicDiscountedAutomationPrice: AutomationPrice = {
    extra_ticket_cost: 0.1,
    num_quota_tickets: null,
    amount: 1500,
    automation_addon_discount: 0.5,
    automation_addon_included: true,
    base_price_id: 'price_1LJBjWI9qXomtXqSPZn8LqlD',
    currency: 'usd',
    interval: PlanInterval.Month,
    legacy_id: 'basic-automation-monthly-usd-4',
    internal_id: 'aut-addon-basic-monthly-usd-4',
    name: 'Basic',
    order: 2,
    product_id: 'prod_LsHD5xmSqoFBBs',
    price_id: 'price_1LJBjWI9qXomtXqSTxkBsRWM',
    features: automationPriceFeatures,
}

export const starterHelpdeskPrice: HelpdeskPrice = {
    amount: 1000,
    extra_ticket_cost: 0.4,
    currency: 'usd',
    features: starterHelpdeskPriceFeatures,
    num_quota_tickets: 50,
    integrations: 150,
    interval: PlanInterval.Month,
    is_legacy: false,
    legacy_id: 'starter-monthly-usd-4',
    internal_id: 'starter-monthly-usd-4',
    limits: {
        messages: {
            default: 100,
            max: 100,
            min: 75,
        },
        tickets: {
            default: 100,
            max: 100,
            min: 75,
        },
    },
    name: 'Starter',
    order: 1,
    phone_limits: {
        billing: 50,
    },
    product_id: 'prod_LsH6kV35G6zKWo',
    price_id: 'price_1LVt4TI9qXomtXqSeHydKB9S',
    public: false,
    trial_period_days: 7,
}

export const voicePrice0: SMSOrVoicePrice = {
    amount: 0,
    currency: 'usd',
    num_quota_tickets: 0,
    internal_id: 'voc-addon-00-monthly-usd-4',
    interval: PlanInterval.Month,
    name: 'Voice Addon Trial Monthly',
    price_id: 'price_1LkClqI9qXomtXqSlgYCG6Wm',
    product_id: 'prod_MT6fyh00TCFRGZ',
    extra_ticket_cost: 2.4,
}

export const voicePrice1: SMSOrVoicePrice = {
    amount: 175,
    currency: 'usd',
    num_quota_tickets: 250,
    internal_id: 'voc-addon-04-monthly-usd-4',
    interval: PlanInterval.Month,
    name: 'Voice Addon 250 Monthly',
    price_id: 'price_1LkAzlI9qXomtXqSxOOrhzcU',
    product_id: 'prod_MT6fyh00TCFRGZ',
    extra_ticket_cost: 1.4,
}

const voicePrice2: SMSOrVoicePrice = {
    amount: 1750,
    currency: 'usd',
    num_quota_tickets: 7500,
    internal_id: 'voc-addon-10-monthly-usd-4',
    interval: PlanInterval.Month,
    name: 'Voice Addon 7500 Monthly',
    price_id: 'price_1LkB44I9qXomtXqS4aF9ibna',
    product_id: 'prod_MT6fyh00TCFRGZ',
    extra_ticket_cost: 0.47,
}

export const smsPrice1: SMSOrVoicePrice = {
    amount: 90,
    currency: 'usd',
    num_quota_tickets: 150,
    internal_id: 'sms-addon-03-monthly-usd-4',
    interval: PlanInterval.Month,
    name: 'SMS Addon 150 Monthly',
    price_id: 'price_1LkBzKI9qXomtXqSEXrSV8o4',
    product_id: 'prod_MT8Fzk7vmcT73m',
    extra_ticket_cost: 1.2,
}

const smsPrice2: SMSOrVoicePrice = {
    amount: 5768,
    currency: 'usd',
    num_quota_tickets: 15000,
    internal_id: 'sms-addon-12-monthly-usd-4',
    interval: PlanInterval.Month,
    name: 'SMS Addon 15000 Monthly',
    price_id: 'price_1LkBzLI9qXomtXqSgzXlOnP4',
    product_id: 'prod_MT8Fzk7vmcT73m',
    extra_ticket_cost: 0.77,
}

export const smsPrice0: SMSOrVoicePrice = {
    amount: 0,
    currency: 'usd',
    num_quota_tickets: 0,
    internal_id: 'sms-addon-00-monthly-usd-4',
    interval: PlanInterval.Month,
    name: 'SMS Addon Trial Monthly',
    price_id: 'price_1M6V7uI9qXomtXqSpsoVQWUw',
    product_id: 'prod_MT8Fzk7vmcT73m',
    extra_ticket_cost: 1.6,
}

export const convertPrice0: ConvertPrice = {
    amount: 0,
    currency: 'usd',
    num_quota_tickets: 0,
    internal_id: 'convert-00-monthly-usd-5',
    interval: PlanInterval.Month,
    name: 'Convert Trial Monthly',
    price_id: 'price_1NdBfmI9qXomtXqSFfC7T2xX',
    product_id: 'prod_Mwy3exdalDFouZ',
    extra_ticket_cost: 1,
    tier: 0,
}

export const convertPrice1: ConvertPrice = {
    amount: 3000,
    currency: 'usd',
    num_quota_tickets: 50,
    internal_id: 'convert-01-monthly-usd-5',
    interval: PlanInterval.Month,
    name: 'Convert 50 Monthly',
    price_id: 'price_1NdBiMI9qXomtXqSX8MxFkYW',
    product_id: 'prod_Mwy3exdalDFouZ',
    extra_ticket_cost: 0,
    tier: 1,
}

export const convertPrice2: ConvertPrice = {
    amount: 25000,
    currency: 'usd',
    num_quota_tickets: 500,
    internal_id: 'convert-02-monthly-usd-5',
    interval: PlanInterval.Month,
    name: 'Convert 500 Monthly',
    price_id: 'price_1NdXfXI9qXomtXqS0CDMe7Yy',
    product_id: 'prod_Mwy3exdalDFouZ',
    extra_ticket_cost: 0,
    tier: 2,
}

export const convertPrice3: ConvertPrice = {
    amount: 80000,
    currency: 'usd',
    num_quota_tickets: 2000,
    internal_id: 'convert-03-monthly-usd-5',
    interval: PlanInterval.Month,
    name: 'Convert 2,000 Monthly',
    price_id: 'price_1NmZrmH2GG3UYmlxBGfOOSLS',
    product_id: 'prod_Mwy3exdalDFouZ',
    extra_ticket_cost: 0,
    tier: 3,
}

export const convertPrice4: ConvertPrice = {
    amount: 110000,
    currency: 'usd',
    num_quota_tickets: 2000,
    internal_id: 'convert-04-monthly-usd-6',
    interval: PlanInterval.Month,
    name: 'Convert 2,000 Monthly',
    price_id: 'price_1NmZrmH2GG3UYmlxBGfOOSL2',
    product_id: 'prod_Mwy3exdalDFouZ',
    extra_ticket_cost: 0,
    tier: 4,
}

export const convertPrice5: ConvertPrice = {
    amount: 157500,
    currency: 'usd',
    num_quota_tickets: 3000,
    internal_id: 'convert-05-monthly-usd-6',
    interval: PlanInterval.Month,
    name: 'Convert 3,000 Monthly',
    price_id: 'price_1NmZrmH2GG3UYmlxBGfOOSL1',
    product_id: 'prod_Mwy3exdalDFouZ',
    extra_ticket_cost: 0,
    tier: 5,
}

export const convertPrice6: ConvertPrice = {
    amount: 36000,
    currency: 'usd',
    num_quota_tickets: 600,
    internal_id: 'convert-01-yearly-usd-6',
    interval: PlanInterval.Year,
    name: 'Convert 600 Yearly',
    price_id: 'price_2NmZrmH2GG3UYmlxBGfOOSL1',
    product_id: 'prod_Mwy3exdalDFouZ',
    extra_ticket_cost: 0,
    tier: 1,
}

export const HELPDESK_PRODUCT_ID = 'prod_LsH6kV35G6zKWo'
export const AUTOMATION_PRODUCT_ID = 'prod_LsHD5xmSqoFBBs'
export const VOICE_PRODUCT_ID = 'prod_MT6fyh00TCFRGZ'
export const SMS_PRODUCT_ID = 'prod_MT8Fzk7vmcT73m'
export const CONVERT_PRODUCT_ID = 'prod_Mwy3exdalDFouZ'

export const helpdeskProduct: Product<HelpdeskPrice> = {
    id: HELPDESK_PRODUCT_ID,
    type: ProductType.Helpdesk,
    prices: [
        basicMonthlyHelpdeskPrice,
        basicYearlyHelpdeskPrice,
        proMonthlyHelpdeskPrice,
        proYearlyHelpdeskPrice,
        advancedMonthlyHelpdeskPrice,
        advancedYearlyHelpdeskPrice,
    ],
}

export const automationProduct: Product<AutomationPrice> = {
    id: AUTOMATION_PRODUCT_ID,
    type: ProductType.Automation,
    prices: [
        basicMonthlyAutomationPrice,
        basicYearlyAutomationPrice,
        proMonthlyAutomationPrice,
        proYearlyAutomationPrice,
        advancedMonthlyAutomationPrice,
        advancedYearlyAutomationPrice,
    ],
}

export const voiceProduct: Product<SMSOrVoicePrice> = {
    id: VOICE_PRODUCT_ID,
    type: ProductType.Voice,
    prices: [voicePrice1, voicePrice2, voicePrice0],
}

export const smsProduct: Product<SMSOrVoicePrice> = {
    id: SMS_PRODUCT_ID,
    type: ProductType.SMS,
    prices: [smsPrice1, smsPrice2, smsPrice0],
}

export const convertProduct: Product<ConvertPrice> = {
    id: CONVERT_PRODUCT_ID,
    type: ProductType.Convert,
    prices: [
        convertPrice0,
        convertPrice1,
        convertPrice2,
        convertPrice3,
        convertPrice4,
        convertPrice5,
        convertPrice6,
    ],
}

export const products: Product<
    HelpdeskPrice | AutomationPrice | SMSOrVoicePrice | ConvertPrice
>[] = [
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
