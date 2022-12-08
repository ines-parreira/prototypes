import {Map} from 'immutable'

import {Product} from 'models/billing/types'

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

export type Subscription = {
    prices: string[]
}

export type BillingImmutableState = Map<any, any>

export type BillingProducts = Product[]

export type BillingState = {
    contact?: BillingContact
    products: BillingProducts
    invoices: Invoice[]
}
