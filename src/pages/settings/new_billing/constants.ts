import {ProductType} from 'models/billing/types'

export const BILLING_BASE_PATH = '/app/settings/new-billing'
export const BILLING_PROCESS_PATH = `${BILLING_BASE_PATH}/process`
export const BILLING_PAYMENT_PATH = `${BILLING_BASE_PATH}/payment`
export const BILLING_PAYMENT_CARD_PATH = `${BILLING_PAYMENT_PATH}/card`
export const BILLING_PAYMENT_FREQUENCY_PATH = `${BILLING_PAYMENT_PATH}/frequency`
export const BILLING_INFORMATION_PATH = `${BILLING_PAYMENT_PATH}/billing-information`
export const BILLING_PAYMENTS_HISTORY_PATH = `${BILLING_BASE_PATH}/payment-history`

export const INTERVAL = {
    Month: 'month',
    Year: 'year',
}

export const BILLABLE_TICKETS_URL =
    'https://docs.gorgias.com/en-US/billable-tickets-199385'
export const PRICING_DETAILS_URL = 'https://www.gorgias.com/pricing'
export const BILLING_SALES_TAX_URL =
    'https://www.gorgias.com/pricing/billing-sales-tax'

export const DATE_FORMAT = 'LL'
export const PRODUCT_INFO = {
    [ProductType.Helpdesk]: {
        title: 'Helpdesk',
        icon: 'desktop_mac',
        counter: 'tickets',
        tooltip: 'Tickets that have a response from an agent or a rule.',
        tooltipLink: BILLABLE_TICKETS_URL,
    },
    [ProductType.Automation]: {
        title: 'Automation',
        icon: 'auto_awesome',
        counter: 'automated interactions',
        tooltip:
            'An interaction is automated when your customer solves their request without human intervention using a feature from our automation add-on.',
        tooltipLink: BILLABLE_TICKETS_URL,
    },
    [ProductType.Voice]: {
        title: 'Voice',
        icon: 'phone',
        counter: 'voice tickets',
        tooltip:
            'Tickets where at least one phone call takes place between your customer and your team.',
        tooltipLink: BILLABLE_TICKETS_URL,
    },
    [ProductType.SMS]: {
        title: 'SMS',
        icon: 'textsms',
        counter: 'SMS tickets',
        tooltip:
            'Tickets where at least one SMS message has been sent from an agent or a rule.',
        tooltipLink: BILLABLE_TICKETS_URL,
    },
}

export const ENTERPRISE_PRICE_ID = '0'
export const ZAPIER_BILLING_HOOK =
    'https://hooks.zapier.com/hooks/catch/9639651/3hsj6pb/'

export const TICKET_SUBJECTS = {
    Enterprise: 'New Enterprise plan request',
    YearlyToMonthly: 'New Billing support request',
    Error: 'New Billing support request',
    ContactUs: 'New Billing support request',
    VoiceSMS: 'Add-on Plan selection',
}

export const BILLING_SUPPORT_EMAIL = 'billing@gorgias.com'
