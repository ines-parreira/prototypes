import { InvoiceCadence } from '@gorgias/helpdesk-types'

import type {
    AccountFeatureMetadata,
    AutomatePlan,
    AutomatePlanFeatures,
    AvailablePlansOf,
    ConvertPlan,
    HelpdeskPlan,
    HelpdeskPlanFeatures,
    SMSOrVoicePlan,
} from './types'
import {
    AccountFeature,
    Cadence,
    HelpdeskPlanTier,
    ProductType,
    SubscriptionStatus,
} from './types'

type FeatureOverrides = Partial<Record<AccountFeature, AccountFeatureMetadata>>

function createHelpdeskPlanFeatures(
    overrides: FeatureOverrides,
): HelpdeskPlanFeatures {
    const features = Object.fromEntries(
        Object.values(AccountFeature).map((feature) => [
            feature,
            { enabled: false },
        ]),
    ) as HelpdeskPlanFeatures

    return {
        ...features,
        ...overrides,
    }
}

const basicHelpdeskPlanFeatures = createHelpdeskPlanFeatures({
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
})

const proHelpdeskPlanFeatures = createHelpdeskPlanFeatures({
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
})

const automatePlanFeatures: AutomatePlanFeatures = {
    [AccountFeature.AutomationManagedRules]: { enabled: true },
    [AccountFeature.AutomationTrackOrderFlow]: { enabled: true },
    [AccountFeature.AutomationReportIssueFlow]: { enabled: true },
    [AccountFeature.AutomationCancellationsFlow]: { enabled: true },
    [AccountFeature.AutomationReturnFlow]: { enabled: true },
    [AccountFeature.AutomationSelfServiceStatistics]: { enabled: true },
}

const accountFeatures = createHelpdeskPlanFeatures({
    [AccountFeature.Api1stPartyRateLimit]: { enabled: true },
    [AccountFeature.Api3rdPartyRateLimit]: { enabled: true },
    [AccountFeature.AutoAssignment]: { enabled: true },
    [AccountFeature.FacebookComment]: { enabled: true },
    [AccountFeature.InstagramComment]: { enabled: true },
    [AccountFeature.InstagramDirectMessage]: { enabled: true },
    [AccountFeature.UsersLiveStatistics]: { enabled: true },
    [AccountFeature.OverviewLiveStatistics]: { enabled: true },
    [AccountFeature.PhoneNumber]: { enabled: true, limit: 5 },
    [AccountFeature.TwitterIntegration]: { enabled: true, limit: 2 },
    [AccountFeature.MagentoIntegration]: { enabled: true },
    [AccountFeature.YotpoIntegration]: { enabled: true },
    [AccountFeature.RevenueStatistics]: { enabled: true },
    [AccountFeature.SatisfactionSurveys]: { enabled: true },
    [AccountFeature.Teams]: { enabled: true },
    [AccountFeature.UserRoles]: { enabled: true },
    [AccountFeature.ViewSharing]: { enabled: true },
    [AccountFeature.HelpCenter]: { enabled: true },
    [AccountFeature.AutomationManagedRules]: { enabled: true },
    [AccountFeature.AutomationTrackOrderFlow]: { enabled: true },
    [AccountFeature.AutomationReportIssueFlow]: { enabled: true },
    [AccountFeature.AutomationCancellationsFlow]: { enabled: true },
    [AccountFeature.AutomationReturnFlow]: { enabled: true },
    [AccountFeature.AutomationSelfServiceStatistics]: { enabled: true },
})

export const HELPDESK_PRODUCT_ID = ProductType.Helpdesk
export const AUTOMATION_PRODUCT_ID = ProductType.Automation
export const VOICE_PRODUCT_ID = ProductType.Voice
export const SMS_PRODUCT_ID = ProductType.SMS
export const CONVERT_PRODUCT_ID = ProductType.Convert

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

export const basicYearlyHelpdeskPlan: HelpdeskPlan = {
    ...basicMonthlyHelpdeskPlan,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Year,
    plan_id: 'basic-yearly-usd-4',
}

export const basicYearlyInvoicedMonthlyHelpdeskPlanGen4: HelpdeskPlan = {
    ...basicMonthlyHelpdeskPlan,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Month,
    plan_id: 'basic-yearly-invoiced_monthly-usd-4',
}

export const basicYearlyInvoicedMonthlyHelpdeskPlanGen5: HelpdeskPlan = {
    ...basicMonthlyHelpdeskPlan,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Month,
    plan_id: 'basic-yearly-invoiced_monthly-usd-5',
}

export const basicYearlyInvoicedMonthlyHelpdeskPlanGen5Variant1: HelpdeskPlan =
    {
        ...basicMonthlyHelpdeskPlan,
        cadence: Cadence.Year,
        invoice_cadence: InvoiceCadence.Month,
        plan_id: 'basic-yearly-invoiced_monthly-usd-5-1',
    }

export const basicYearlyInvoicedMonthlyHelpdeskPlanGen5Variant5: HelpdeskPlan =
    {
        ...basicMonthlyHelpdeskPlan,
        cadence: Cadence.Year,
        invoice_cadence: InvoiceCadence.Month,
        plan_id: 'basic-yearly-invoiced_monthly-usd-5-5',
    }

export const proYearlyInvoicedMonthlyHelpdeskPlanGen5Variant1: HelpdeskPlan = {
    ...proMonthlyHelpdeskPlan,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Month,
    plan_id: 'pro-yearly-invoiced_monthly-usd-5-1',
}

export const proYearlyHelpdeskPlan: HelpdeskPlan = {
    ...proMonthlyHelpdeskPlan,
    cadence: Cadence.Year,
    invoice_cadence: InvoiceCadence.Year,
    plan_id: 'pro-yearly-usd-5',
}

export const proYearlyInvoicedBiannuallyHelpdeskPlanGen5Variant1: HelpdeskPlan =
    {
        ...proMonthlyHelpdeskPlan,
        cadence: Cadence.Year,
        invoice_cadence: InvoiceCadence.Biannual,
        plan_id: 'pro-yearly-invoiced_biannually-usd-5-1',
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

const helpdeskProduct: AvailablePlansOf<ProductType.Helpdesk> = {
    type: ProductType.Helpdesk,
    prices: [basicMonthlyHelpdeskPlan, proMonthlyHelpdeskPlan],
}

const automationProduct: AvailablePlansOf<ProductType.Automation> = {
    type: ProductType.Automation,
    prices: [automate02MonthlyMeteredPlan],
}

const smsProduct: AvailablePlansOf<ProductType.SMS> = {
    type: ProductType.SMS,
    prices: [smsPlan1],
}

const voiceProduct: AvailablePlansOf<ProductType.Voice> = {
    type: ProductType.Voice,
    prices: [voicePlan1],
}

const convertProduct: AvailablePlansOf<ProductType.Convert> = {
    type: ProductType.Convert,
    prices: [convertPlan1],
}

export const products: AvailablePlansOf<ProductType>[] = [
    helpdeskProduct,
    automationProduct,
    smsProduct,
    voiceProduct,
    convertProduct,
]

export const account = {
    id: 1,
    current_subscription: {
        trial_start_datetime: '2017-08-23T01:38:53+00:00',
        trial_end_datetime: '2017-09-06T01:38:53+00:00',
        status: SubscriptionStatus.TRIALING,
        start_datetime: '2017-08-23T01:38:53+00:00',
        products: {
            [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
        },
        scheduled_to_cancel_at: null,
    },
    created_datetime: '2017-08-23T01:38:52.479339+00:00',
    deactivated_datetime: null,
    domain: 'acme',
    meta: {},
    settings: [
        {
            id: 2,
            type: 'business-hours',
            data: {
                business_hours: [
                    {
                        days: '1,2,3,4,5',
                        from_time: '00:00',
                        to_time: '01:00',
                    },
                    {
                        days: '7',
                        from_time: '07:00',
                        to_time: '22:00',
                    },
                ],
                timezone: 'US/Pacific',
            },
        },
    ],
    status: {
        status: 'active',
    },
    stripe_id: 'cus_BGKUKAzUbK1bix',
    user_id: 1,
    features: accountFeatures,
}

export const shopifyIntegration = {
    user: { id: 0 },
    deleted_datetime: null,
    meta: {
        sync_customer_notes: true,
        shop_id: 1,
        shop_phone: null,
        uses_multi_currency: false,
        shop_domain: 'shopify.myshopify.com',
        currency: 'EUR',
        shop_display_name: 'Shpify store',
        shop_plan: 'partner_test',
        shop_name: 'shopify-store',
        oauth: {
            scope: '',
            status: 'success',
            error: '',
        },
        import_state: {
            customers: {
                is_over: true,
                oldest_created_at: '2023-04-19T05:13:38-04:00',
            },
            products: {
                is_over: true,
                oldest_created_at: '2023-04-19T05:10:00-04:00',
            },
        },
        webhooks: [],
        need_scope_update: false,
    },
    deactivated_datetime: null,
    name: 'shopify-store',
    uri: '/api/integrations/8/',
    decoration: null,
    locked_datetime: null,
    created_datetime: '2023-06-22T11:31:46.841843+00:00',
    type: 'shopify',
    id: 8,
    description: null,
    updated_datetime: '2023-09-07T11:28:13.345251+00:00',
    managed: false,
}
