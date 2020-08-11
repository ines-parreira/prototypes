import {Map} from 'immutable'

export type BillingContact = Map<any, any>

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

enum PaymentMethodType {
    Stripe = 'stripe',
}

export type PaymentMethod = {
    active: boolean
    method: PaymentMethodType
}

//$TsFixMe should replace existing BillingContact on removing immutable
export type BillingContactResponse = {
    email: string
    shipping: {
        address: {
            city: string
            country: string
            line1: string
            line2: string
            postal_code: string
            state: string
        }
        name: string
        phone: string
    }
}

export type BillingState = Map<any, any>

enum SubscriptionPlan {
    AdvancedYearlyUSD2 = 'advanced-yearly-usd-2',
}

export type Subscription = {
    plan: SubscriptionPlan
}
