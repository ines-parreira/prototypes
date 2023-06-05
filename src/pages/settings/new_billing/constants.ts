import {ProductType} from 'models/billing/types'

export const BILLING_BASE_PATH = '/app/settings/new-billing'

export const BILLING_PAYMENT_PATH = `${BILLING_BASE_PATH}/payment`
export const BILLING_PAYMENTS_HISTORY = `${BILLING_BASE_PATH}/payment-history`

export const DATE_FORMAT = 'LL'
export const PRODUCT_INFO = {
    [ProductType.Helpdesk]: {
        title: 'Helpdesk',
        icon: 'desktop_mac',
        counter: 'tickets used',
        tooltip: 'Tickets that have a response from an agent or a rule.',
        tooltipLink: '#',
    },
    [ProductType.Automation]: {
        title: 'Automation',
        icon: 'auto_awesome',
        counter: 'automated interactions used',
        tooltip:
            'An interaction is automated when your customer solves their request without human intervention using a feature from our automation add-on.',
        tooltipLink: '#',
    },
    [ProductType.Voice]: {
        title: 'Voice',
        icon: 'phone',
        counter: 'voice tickets used',
        tooltip:
            'Tickets where at least one phone call takes place between your customer and your team.',
        tooltipLink: '#',
    },
    [ProductType.SMS]: {
        title: 'SMS',
        icon: 'textsms',
        counter: 'SMS tickets used',
        tooltip:
            'Tickets where at least one SMS message has been sent from an agent or a rule.',
        tooltipLink: '#',
    },
}
