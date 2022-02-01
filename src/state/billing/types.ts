import {Map} from 'immutable'

import {Plan} from '../../models/billing/types'

export type BillingContactImmutable = Map<any, any>

export type CreditCard = {
    expDate: string
    name: string
    number: string
    cvc: string
}

export type CurrentUsage = {
    cost: number
    extra_tickets: number
    messages: number
    tickets: number
}

enum PaymentType {
    Stripe = 'stripe',
}

enum PaymentIntentStatus {
    RequiresSource = 'requires_source',
}

export type Invoice = {
    amount_due: number
    attempted: boolean
    date: Date
    description: string
    id: string
    invoice_pdf: string
    metadata: {
        payment_service: PaymentType
    }
    paid: boolean
    payment_confirmation_url: Maybe<string>
    payment_intent: {
        status: PaymentIntentStatus
    }
}

export enum PaymentMethodType {
    Shopify = 'shopify',
    Stripe = 'stripe',
}

export type PaymentMethod = {
    active: boolean
    method: PaymentMethodType
}

export type BillingContact = {
    email: string
    shipping: {
        address: {
            city: string
            country: string
            line1: string
            line2: string
            postal_code: string
            state?: string
        }
        name: string
        phone: string
    }
}

export enum SubscriptionPlan {
    BasicMonthlyUSD2 = 'basic-monthly-usd-2',
    BasicAutomationMonthlyUSD2 = 'basic-automation-monthly-usd-2',
    ProMonthlyUSD2 = 'pro-monthly-usd-2',
    ProAutomationMonthlyUSD2 = 'pro-automation-monthly-usd-2',
    AdvancedMonthlyUSD2 = 'advanced-monthly-usd-2',
    AdvancedAutomationMonthlyUSD2 = 'advanced-automation-monthly-usd-2',
    BasicYearlyUSD2 = 'basic-yearly-usd-2',
    BasicAutomationYearlyUSD2 = 'basic-automation-yearly-usd-2',
    ProYearlyUSD2 = 'pro-yearly-usd-2',
    ProAutomationYearlyUSD2 = 'pro-automation-yearly-usd-2',
    AdvancedYearlyUSD2 = 'advanced-yearly-usd-2',
    AdvancedAutomationYearlyUSD2 = 'advanced-automation-yearly-usd-2',
}

export type Subscription = {
    plan: SubscriptionPlan
}

export type PlanWithCurrencySign = Plan & {
    currencySign: '$'
}

export type BillingImmutableState = Map<any, any>

export type BillingState = {
    contact?: BillingContact
    plans: {
        [plan in SubscriptionPlan]: Plan
    }
    futureSubscriptionPlan?: string
    invoices: Invoice[]
}
