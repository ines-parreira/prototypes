import type { ProductSubscriptionDescriptions, Reason } from './types'
import { ProductType, TaxIdType, VATCountries } from './types'

export const BILLING_BASE_PATH = '/app/settings/billing'
export const BILLING_INTERNAL_PATH = `${BILLING_BASE_PATH}/internal`
export const BILLING_PROCESS_PATH = `${BILLING_BASE_PATH}/process`
export const BILLING_PAYMENT_PATH = `${BILLING_BASE_PATH}/payment`
export const BILLING_PAYMENT_CARD_PATH = `${BILLING_PAYMENT_PATH}/card`
export const BILLING_PAYMENT_FREQUENCY_PATH = `${BILLING_PAYMENT_PATH}/frequency`
export const BILLING_INFORMATION_PATH = `${BILLING_PAYMENT_PATH}/billing-information`
export const BILLING_PAYMENTS_HISTORY_PATH = `${BILLING_BASE_PATH}/payment-history`

export const SELECTED_PRODUCTS_SESSION_STORAGE_KEY =
    'billing:trialOrCanceledSubscription:selectedProducts'

export const ACTIVATE_PAYMENT_WITH_SHOPIFY_URL =
    '/integrations/shopify/billing/activate'

export const STORE_MANAGEMENT_PATH = '/app/settings/store-management'
export const PRICING_DETAILS_URL = 'https://www.gorgias.com/pricing'

export const DATE_FORMAT = 'LL'
export const PRODUCT_INFO = {
    [ProductType.Helpdesk]: {
        title: 'Helpdesk',
        icon: 'desktop_mac',
        counter: 'tickets',
        perTicket: 'per ticket',
        tooltip:
            'Tickets with a response sent from Gorgias by any sender (human agents, rules, or AI Agent).',
        tooltipLink: 'https://link.gorgias.com/vw1',
        bannerLink: '/app/settings',
    },
    [ProductType.Automation]: {
        title: 'AI Agent',
        icon: 'bolt',
        counter: 'automated interactions',
        perTicket: 'per automated interaction',
        tooltip:
            'Tickets fully resolved by AI Agent and automations, without human intervention.',
        tooltipLink: 'https://link.gorgias.com/5jnkqn7',
        bannerLink: '/app/automation',
    },
    [ProductType.Voice]: {
        title: 'Voice',
        icon: 'phone',
        counter: 'voice tickets',
        perTicket: 'per voice ticket',
        tooltip:
            'Tickets where at least one phone call takes place between your customer and your team.',
        tooltipLink: 'https://link.gorgias.com/4j9',
        bannerLink: 'https://docs.gorgias.com/en-US/set-up-voice-81798',
    },
    [ProductType.SMS]: {
        title: 'SMS',
        icon: 'textsms',
        counter: 'SMS tickets',
        perTicket: 'per SMS ticket',
        tooltip:
            'Tickets where at least one SMS message has been sent from an agent or a rule.',
        tooltipLink: 'https://link.gorgias.com/bfde15',
        bannerLink: 'https://docs.gorgias.com/en-US/set-up-sms-81919',
    },
    [ProductType.Convert]: {
        title: 'Convert',
        icon: 'paid',
        counter: 'clicks',
        perTicket: 'per click',
        tooltip:
            'Campaign clicks represent the cumulative count of instances when a visitor clicks on campaigns.',
        tooltipLink: 'https://link.gorgias.com/d71713',
        bannerLink: '/app/convert',
    },
}

export const ENTERPRISE_PLAN_ID = '0'
export const ZAPIER_BILLING_HOOK =
    'https://hooks.zapier.com/hooks/catch/9639651/3hsj6pb/'
export const ZAPIER_REMOVE_AAO_HOOK =
    'https://hooks.zapier.com/hooks/catch/10853648/35nmhz0/'

export const BILLING_SUPPORT_EMAIL = 'billing@gorgias.com'

export const CANCEL_AUTOMATION_REASONS: Reason[] = [
    { value: false, label: `It's not automating enough` },
    { value: false, label: `It's missing features` },
    { value: false, label: `It's too expensive` },
    {
        value: false,
        label: `I don't have capacity to set it up/it's not a priority right now`,
    },
    { value: false, label: `I'm using an alternative` },
    { value: false, label: `I'm not using Gorgias Chat or Help Center` },
    { value: false, label: `I didn't know I purchased it` },
    { value: false, label: `Other` },
]

export const PRODUCT_SUBSCRIPTION_DESCRIPTION: ProductSubscriptionDescriptions =
    {
        [ProductType.Helpdesk]: {},
        [ProductType.Automation]: {
            detailsLink: {
                label: 'Explore Pricing Plans',
                url: 'https://link.gorgias.com/vyp',
            },
            features: [
                'Lower ticket volume, resolution time, and stress',
                'Choose a plan based on your usage',
                'Change plans or cancel at any time',
                'Increase conversion and drive more revenue',
            ],
        },
        [ProductType.Voice]: {},
        [ProductType.SMS]: {},
        [ProductType.Convert]: {
            features: [
                'Reach customers at the right time with personalized campaigns.',
                'Increase your average order value with targeted product recommendations.',
                'Send exclusive offers to visitors about to leave your website.',
            ],
        },
    }

export const PRODUCT_DISABLED_FOR_TRIALING_USERS_TOOLTIP =
    'To subscribe to this product, you must have a paid Helpdesk subscription'

export const BILLING_PAUSED_TOOLTIP =
    'Your billing is paused. Please contact support to make changes.'

export const TAX_ID_VALIDATION: {
    [key in TaxIdType]: {
        countries: string[]
        states?: string[]
    }
} = {
    [TaxIdType.eu_vat]: {
        countries: Object.values(VATCountries),
    },
    [TaxIdType.au_abn]: {
        countries: ['AU'],
    },
    [TaxIdType.ca_gst_hst]: {
        countries: ['CA'],
    },
    [TaxIdType.ca_pst_bc]: {
        countries: ['CA'],
        states: ['BC'],
    },
    [TaxIdType.ca_pst_sk]: {
        countries: ['CA'],
        states: ['SK'],
    },
    [TaxIdType.ca_pst_mb]: {
        countries: ['CA'],
        states: ['MB'],
    },
    [TaxIdType.ca_qst]: {
        countries: ['CA'],
        states: ['QC'],
    },
}
