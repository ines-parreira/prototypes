import { fromJS } from 'immutable'
import moment from 'moment/moment'

import { InvoiceCadence } from '@gorgias/helpdesk-types'

import { account } from 'fixtures/account'
import { shopifyIntegration } from 'fixtures/integrations'
import {
    automate02MonthlyMeteredPlan,
    AUTOMATION_PRODUCT_ID,
    basicMonthlyHelpdeskPlan,
    CONVERT_PRODUCT_ID,
    convertPlan1,
    HELPDESK_PRODUCT_ID,
    products,
    proMonthlyHelpdeskPlan,
    SMS_PRODUCT_ID,
    smsPlan1,
    VOICE_PRODUCT_ID,
    voicePlan1,
} from 'fixtures/plans'
import type {
    BillingState,
    ProductUsages,
    SubscriptionSummary,
    UpcomingInvoiceSummary,
} from 'models/billing/types'
import { Cadence, ProductType, SubscriptionStatus } from 'models/billing/types'
import type { Invoice } from 'state/billing/types'
import { PaymentIntentStatus, PaymentType } from 'state/billing/types'

export const baseInvoice: Invoice = {
    description: 'Pro plan for 2023-04',
    invoice_pdf: 'https://example.com/invoice.pdf',
    total: 500000,
    amount_due: 322052,
    amount_paid: 150000,
    payment_intent: { status: PaymentIntentStatus.Succeeded },
    payment_confirmation_url: null,
    attempted: true,
    id: 'inv_001',
    paid: true,
    date: 1682535698,
    metadata: { payment_service: PaymentType.Stripe },
}

export const storeWithTrialingSubscription = {
    currentAccount: fromJS({
        ...account,
        meta: { hasCreditCard: true },
        current_subscription: {
            ...account.current_subscription,
            products: {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
            },
            status: SubscriptionStatus.TRIALING,
        },
    }),
    billing: fromJS({ invoices: [], products, currentProductsUsage: {} }),
    integrations: fromJS({ integrations: [shopifyIntegration] }),
}

export const storeWithCanceledSubscription = {
    currentAccount: fromJS({
        ...account,
        current_subscription: null,
    }),
    billing: fromJS({
        invoices: [],
        products,
        currentProductsUsage: {},
    }),
    integrations: fromJS({ integrations: [shopifyIntegration] }),
}

export const storeWithActiveSubscriptionWithAutomation = {
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            ...account.current_subscription,
            products: {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                [AUTOMATION_PRODUCT_ID]: automate02MonthlyMeteredPlan.plan_id,
            },
        },
    }),
    billing: fromJS({ invoices: [], products, currentProductsUsage: {} }),
}

export const storeWithActiveSubscriptionWithConvert = {
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            ...account.current_subscription,
            products: {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                [CONVERT_PRODUCT_ID]: convertPlan1.plan_id,
            },
        },
    }),
    billing: fromJS({ invoices: [], products, currentProductsUsage: {} }),
}

const defaultProductUsage = {
    data: {
        extra_tickets_cost_in_cents: 0,
        num_tickets: 0,
        num_extra_tickets: 0,
    },
    meta: {
        subscription_start_datetime: moment.utc().toISOString(),
        subscription_end_datetime: moment.utc().add(1, 'month').toISOString(),
    },
}

export const currentProductsUsageWithPhone = {
    [ProductType.Helpdesk]: defaultProductUsage,
    [ProductType.Convert]: defaultProductUsage,
    [ProductType.SMS]: defaultProductUsage,
    [ProductType.Voice]: defaultProductUsage,
}

export const storeWithActiveSubscriptionWithPhone = {
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            ...account.current_subscription,
            products: {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                [CONVERT_PRODUCT_ID]: convertPlan1.plan_id,
                [SMS_PRODUCT_ID]: smsPlan1.plan_id,
                [VOICE_PRODUCT_ID]: voicePlan1.plan_id,
            },
        },
    }),
    billing: fromJS({
        invoices: [],
        products,
        currentProductsUsage: currentProductsUsageWithPhone,
    }),
}

export const storeWithNewlyActiveSubscriptionWithPhone = {
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            ...account.current_subscription,
            products: {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                [CONVERT_PRODUCT_ID]: convertPlan1.plan_id,
                [SMS_PRODUCT_ID]: smsPlan1.plan_id,
                [VOICE_PRODUCT_ID]: voicePlan1.plan_id,
            },
            start_datetime: moment.utc().toISOString(),
            status: SubscriptionStatus.ACTIVE,
        },
    }),
    billing: fromJS({
        invoices: [],
        products,
        currentProductsUsage: currentProductsUsageWithPhone,
    }),
}

export const usages: ProductUsages = {
    helpdesk: {
        num_tickets: 10,
        num_extra_tickets: 0,
        extra_tickets_cost_in_cents: 0,
    },
    automation: null,
    voice: null,
    sms: null,
    convert: null,
}

const upcomingInvoice: UpcomingInvoiceSummary = {
    coupon: null,
    subtotal_in_cents: 9900,
    subtotal_decimal: '99',
    total_in_cents: 9900,
    total_decimal: '99',
    usages: usages,
}

const subscription: SubscriptionSummary = {
    status: SubscriptionStatus.ACTIVE,
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    is_trialing: false,
    trial_start_datetime: null,
    trial_end_datetime: null,
    has_schedule: false,
    downgrade_scheduled: false,
    scheduled_to_cancel_at: null,
    current_billing_cycle_start_datetime: '2024-07-22T00:00:00+00:00',
    current_billing_cycle_end_datetime: '2024-08-22T00:00:00+00:00',
    coupon: null,
    trial_extended_until: null,
}

export const payingWithCreditCard: BillingState = {
    upcoming_invoice: upcomingInvoice,
    subscription: subscription,
    customer: {
        trial_extended_until: null,
        coupon: null,
        credit_card: {
            brand: 'Visa',
            last4: '4321',
            exp_year: 2052,
            exp_month: 12,
        },
        shopify_billing: null,
        ach_debit_bank_account: null,
        ach_credit_bank_account: null,
        payment_term_days: null,
    },
    current_plans: {
        helpdesk: basicMonthlyHelpdeskPlan,
        automate: null,
        sms: null,
        voice: null,
        convert: null,
    },
}

export const payingWithExpiredCreditCard: BillingState = {
    ...payingWithCreditCard,
    customer: {
        ...payingWithCreditCard.customer,
        credit_card: {
            brand: 'Visa',
            last4: '4321',
            exp_year: 2023,
            exp_month: 12,
        },
    },
}

export const payingWithAchDebit: BillingState = {
    ...payingWithCreditCard,
    customer: {
        ...payingWithCreditCard.customer,
        credit_card: null,
        ach_debit_bank_account: {
            bank_name: 'Wells Fargo',
            last4: '9876',
        },
    },
}

export const payingWithAchCredit: BillingState = {
    ...payingWithCreditCard,
    customer: {
        ...payingWithCreditCard.customer,
        credit_card: null,
        ach_credit_bank_account: {
            bank_name: 'Citigroup',
            last4: '9988',
        },
    },
}

export const payWithShopifyButNotActivated: BillingState = {
    ...payingWithCreditCard,
    customer: {
        ...payingWithCreditCard.customer,
        credit_card: null,
        shopify_billing: {
            subscription_id: null,
        },
    },
}

export const payWithShopifyButNotActivatedAndPastDue: BillingState = {
    ...payingWithCreditCard,
    subscription: {
        ...payingWithCreditCard.subscription,
        status: SubscriptionStatus.PAST_DUE,
    },
    customer: {
        ...payingWithCreditCard.customer,
        credit_card: null,
        shopify_billing: {
            subscription_id: null,
        },
    },
}

export const payWithShopify: BillingState = {
    ...payingWithCreditCard,
    customer: {
        ...payingWithCreditCard.customer,
        credit_card: null,
        shopify_billing: {
            subscription_id: '28982542566',
        },
    },
}

export const trial: BillingState = {
    upcoming_invoice: upcomingInvoice,
    subscription: {
        ...subscription,
        status: SubscriptionStatus.TRIALING,
        trial_start_datetime: '2024-07-22T00:00:00+00:00',
        trial_end_datetime: '2024-07-29T00:00:00+00:00',
    },
    customer: {
        trial_extended_until: null,
        coupon: null,
        credit_card: null,
        shopify_billing: null,
        ach_debit_bank_account: null,
        ach_credit_bank_account: null,
        payment_term_days: null,
    },
    current_plans: {
        helpdesk: proMonthlyHelpdeskPlan,
        automate: automate02MonthlyMeteredPlan,
        sms: null,
        voice: null,
        convert: null,
    },
}
