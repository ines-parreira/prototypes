import {AccountFeature} from 'state/currentAccount/types'
import {
    AutomationPrice,
    AutomationPriceFeatures,
    HelpdeskPrice,
    HelpdeskPriceFeatures,
    PlanInterval,
    Product,
    ProductType,
} from 'models/billing/types'
import {
    createAutomationPlanFromProducts,
    createHelpdeskPlanFromProducts,
} from 'models/billing/utils'
import {BillingProducts} from 'state/billing/types'

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
    [AccountFeature.ChatCampaigns]: {enabled: true},
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
}

export const automationPriceFeatures: AutomationPriceFeatures = {
    [AccountFeature.AutomationManagedRules]: {enabled: true},
    [AccountFeature.AutomationTrackOrderFlow]: {enabled: true},
    [AccountFeature.AutomationReportIssueFlow]: {enabled: true},
    [AccountFeature.AutomationCancellationsFlow]: {enabled: true},
    [AccountFeature.AutomationReturnFlow]: {enabled: true},
    [AccountFeature.AutomationSelfServiceStatistics]: {enabled: true},
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
    [AccountFeature.ChatCampaigns]: {enabled: true},
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
    [AccountFeature.ChatCampaigns]: {enabled: true},
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
    [AccountFeature.ChatCampaigns]: {enabled: true},
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
    [AccountFeature.ChatCampaigns]: {enabled: true},
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
}

export const basicMonthlyHelpdeskPrice: HelpdeskPrice = {
    addons: ['price_1LJBjXI9qXomtXqSSX34F3we'],
    amount: 6000,
    cost_per_ticket: 0.4,
    currency: 'usd',
    features: basicHelpdeskPriceFeatures,
    free_tickets: 300,
    integrations: 150,
    interval: PlanInterval.Month,
    is_legacy: false,
    legacy_id: 'basic-monthly-usd-4',
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
    cost_per_ticket: 0.4,
    currency: 'usd',
    features: basicHelpdeskPriceFeatures,
    free_tickets: 3600,
    integrations: 150,
    interval: PlanInterval.Year,
    is_legacy: false,
    legacy_id: 'basic-yearly-usd-4',
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
    cost_per_ticket: 0.36,
    currency: 'usd',
    features: proHelpdeskPriceFeatures,
    free_tickets: 2000,
    integrations: 150,
    interval: PlanInterval.Month,
    is_legacy: false,
    legacy_id: 'pro-monthly-usd-4',
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
    cost_per_ticket: 0.36,
    currency: 'usd',
    features: proHelpdeskPriceFeatures,
    free_tickets: 24000,
    integrations: 150,
    interval: PlanInterval.Year,
    is_legacy: false,
    legacy_id: 'pro-yearly-usd-4',
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
    cost_per_ticket: 0.36,
    currency: 'usd',
    features: advancedHelpdeskPriceFeatures,
    free_tickets: 5000,
    integrations: 150,
    interval: PlanInterval.Month,
    is_legacy: false,
    legacy_id: 'advanced-monthly-usd-4',
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
    cost_per_ticket: 0.36,
    currency: 'usd',
    features: advancedHelpdeskPriceFeatures,
    free_tickets: 60000,
    integrations: 150,
    interval: PlanInterval.Year,
    is_legacy: false,
    legacy_id: 'advanced-yearly-usd-4',
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
    additional_cost_per_ticket: 0.2,
    automation_addon_discount: 0,
    automation_addon_included: true,
    base_price_id: 'price_1LJBjWI9qXomtXqSPZn8LqlD',
    currency: 'usd',
    features: automationPriceFeatures,
    interval: PlanInterval.Month,
    legacy_id: 'basic-automation-full-price-monthly-usd-4',
    name: 'Basic',
    order: 2,
    product_id: 'prod_LsHD5xmSqoFBBs',
    price_id: 'price_1LJBjXI9qXomtXqSSX34F3we',
}

export const basicYearlyAutomationPrice: AutomationPrice = {
    amount: 30000,
    additional_cost_per_ticket: 0.2,
    automation_addon_discount: 0,
    automation_addon_included: true,
    base_price_id: 'price_1LJBjYI9qXomtXqSLEjOrpmV',
    currency: 'usd',
    features: automationPriceFeatures,
    interval: PlanInterval.Year,
    legacy_id: 'basic-automation-full-price-yearly-usd-4',
    name: 'Basic',
    order: 2,
    product_id: 'prod_LsHD5xmSqoFBBs',
    price_id: 'price_1LJBjZI9qXomtXqSPNgkEZpl',
}

export const proMonthlyAutomationPrice: AutomationPrice = {
    additional_cost_per_ticket: 0.18,
    amount: 18000,
    automation_addon_discount: 0,
    automation_addon_included: true,
    base_price_id: 'price_1LJBjaI9qXomtXqSvYfzmmEU',
    currency: 'usd',
    features: automationPriceFeatures,
    interval: PlanInterval.Month,
    legacy_id: 'pro-automation-full-price-monthly-usd-4',
    name: 'Pro',
    order: 3,
    product_id: 'prod_LsHD5xmSqoFBBs',
    price_id: 'price_1LJBjbI9qXomtXqS2sfi1J7P',
}

export const proYearlyAutomationPrice: AutomationPrice = {
    additional_cost_per_ticket: 0.18,
    amount: 180000,
    automation_addon_discount: 0,
    automation_addon_included: true,
    base_price_id: 'price_1LJBjbI9qXomtXqShB9YLy7V',
    currency: 'usd',
    features: automationPriceFeatures,
    interval: PlanInterval.Year,
    legacy_id: 'pro-automation-full-price-yearly-usd-4',
    name: 'Pro',
    order: 3,
    product_id: 'prod_LsHD5xmSqoFBBs',
    price_id: 'price_1LJBjdI9qXomtXqSlp9sh6iQ',
}

export const advancedMonthlyAutomationPrice: AutomationPrice = {
    additional_cost_per_ticket: 0.18,
    amount: 45000,
    automation_addon_discount: 0,
    automation_addon_included: true,
    base_price_id: 'price_1LJBjdI9qXomtXqS8RzPPA7K',
    currency: 'usd',
    features: automationPriceFeatures,
    interval: PlanInterval.Month,
    legacy_id: 'advanced-automation-full-price-monthly-usd-4',
    name: 'Advanced',
    order: 4,
    product_id: 'prod_LsHD5xmSqoFBBs',
    price_id: 'price_1LJBjeI9qXomtXqSXRjmhPsL',
}

export const advancedYearlyAutomationPrice: AutomationPrice = {
    additional_cost_per_ticket: 0.18,
    amount: 450000,
    automation_addon_discount: 0,
    automation_addon_included: true,
    base_price_id: 'price_1LJBjfI9qXomtXqSeKJ5lJjD',
    currency: 'usd',
    features: automationPriceFeatures,
    interval: PlanInterval.Year,
    legacy_id: 'advanced-automation-full-price-yearly-usd-4',
    name: 'Advanced',
    order: 4,
    product_id: 'prod_LsHD5xmSqoFBBs',
    price_id: 'price_1LJBjgI9qXomtXqSBZoBcg7G',
}

export const legacyBasicHelpdeskPrice: HelpdeskPrice = {
    addons: ['price_1LJBlbI9qXomtXqSvvtgyZ1z'],
    amount: 6000,
    cost_per_ticket: 0.06,
    currency: 'usd',
    features: basicHelpdeskPriceFeatures,
    free_tickets: 600,
    integrations: 7,
    interval: PlanInterval.Month,
    is_legacy: true,
    legacy_id: 'basic-usd-1',
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
    additional_cost_per_ticket: 0,
    amount: 1500,
    automation_addon_discount: 0.5,
    automation_addon_included: true,
    base_price_id: 'price_1LJBlXI9qXomtXqSddDEgsDA',
    currency: 'usd',
    features: automationPriceFeatures,
    interval: PlanInterval.Month,
    legacy_id: 'basic-automation-usd-1',
    name: 'BasicPlan',
    product_id: 'prod_LsHD5xmSqoFBBs',
    price_id: 'price_1LJBlbI9qXomtXqSvvtgyZ1z',
}

export const customHelpdeskPrice: HelpdeskPrice = {
    addons: ['price_1LJBjiI9qXomtXqSvQBcRw5V'],
    amount: 160000,
    cost_per_ticket: 0.32,
    currency: 'usd',
    custom: true,
    features: customHelpdeskPriceFeatures,
    free_tickets: 10000,
    integrations: 150,
    interval: PlanInterval.Month,
    is_legacy: false,
    legacy_id: 'custom-monthly-usd-4-1',
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
    additional_cost_per_ticket: 0.16,
    amount: 80000,
    automation_addon_discount: 0,
    automation_addon_included: true,
    base_price_id: 'price_1LJBjhI9qXomtXqSAUwsyU2z',
    currency: 'usd',
    features: automationPriceFeatures,
    interval: PlanInterval.Month,
    legacy_id: 'custom-automation-full-price-monthly-usd-4-1',
    name: 'Custom',
    product_id: 'prod_LsHD5xmSqoFBBs',
    price_id: 'price_1LJBjiI9qXomtXqSvQBcRw5V',
}

export const basicDiscountedAutomationPrice: AutomationPrice = {
    additional_cost_per_ticket: 0.1,
    amount: 1500,
    automation_addon_discount: 0.5,
    automation_addon_included: true,
    base_price_id: 'price_1LJBjWI9qXomtXqSPZn8LqlD',
    currency: 'usd',
    interval: PlanInterval.Month,
    legacy_id: 'basic-automation-monthly-usd-4',
    name: 'Basic',
    order: 2,
    product_id: 'prod_LsHD5xmSqoFBBs',
    price_id: 'price_1LJBjWI9qXomtXqSTxkBsRWM',
    features: automationPriceFeatures,
}

export const starterHelpdeskPrice: HelpdeskPrice = {
    amount: 1000,
    cost_per_ticket: 0.4,
    currency: 'usd',
    features: starterHelpdeskPriceFeatures,
    free_tickets: 50,
    integrations: 150,
    interval: PlanInterval.Month,
    is_legacy: false,
    legacy_id: 'starter-monthly-usd-4',
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

export const transitoryPlans = {
    basicPlan: createHelpdeskPlanFromProducts(
        basicMonthlyHelpdeskPrice,
        basicMonthlyAutomationPrice
    ),
    basicAutomationPlan: createAutomationPlanFromProducts(
        basicMonthlyAutomationPrice,
        basicMonthlyHelpdeskPrice
    ),
    proPlan: createHelpdeskPlanFromProducts(
        proMonthlyHelpdeskPrice,
        proMonthlyAutomationPrice
    ),
    proAutomationPlan: createAutomationPlanFromProducts(
        proMonthlyAutomationPrice,
        proMonthlyHelpdeskPrice
    ),
    advancedPlan: createHelpdeskPlanFromProducts(
        advancedMonthlyHelpdeskPrice,
        advancedMonthlyAutomationPrice
    ),
    advancedAutomationPlan: createAutomationPlanFromProducts(
        advancedMonthlyAutomationPrice,
        advancedMonthlyHelpdeskPrice
    ),
    customPlan: createHelpdeskPlanFromProducts(
        customHelpdeskPrice,
        customAutomationPrice
    ),
    customAutomationPlan: createAutomationPlanFromProducts(
        customAutomationPrice,
        customHelpdeskPrice
    ),
    legacyPlan: createHelpdeskPlanFromProducts(
        legacyBasicHelpdeskPrice,
        legacyBasicAutomationPrice
    ),
}

export const HELPDESK_PRODUCT_ID = 'prod_LsH6kV35G6zKWo'
export const AUTOMATION_PRODUCT_ID = 'prod_LsHD5xmSqoFBBs'

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

export const products: BillingProducts = [helpdeskProduct, automationProduct]
