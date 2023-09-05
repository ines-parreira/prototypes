import {Map} from 'immutable'

import {Product, ProductType} from 'models/billing/types'
import {AlertType} from 'pages/common/components/Alert/Alert'

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

export type CurrentUsagePerProduct = {
    data: {
        extra_tickets_cost_in_cents: number
        num_extra_tickets: number
        num_tickets: number
    }
    meta: {
        subscription_start_datetime: string
        subscription_end_datetime: string
    }
}

export type CurrentProductsUsages = {
    [ProductType.Helpdesk]: CurrentUsagePerProduct | null
    [ProductType.Automation]: CurrentUsagePerProduct | null
    [ProductType.Voice]: CurrentUsagePerProduct | null
    [ProductType.SMS]: CurrentUsagePerProduct | null
}

export enum PaymentType {
    Stripe = 'stripe',
    Shopify = 'shopify',
}

export enum PaymentIntentStatus {
    RequiresSource = 'requires_source',
    RequiresConfirmation = 'requires_source_action',
    Succeeded = 'succeeded',
}

export type Invoice = {
    amount_due: number
    attempted: boolean
    date: number
    description: string | null
    id: string
    invoice_pdf: string
    metadata: {
        payment_service: PaymentType
        extra_tickets?: string
        extra_usage?: string
        gorgias_release?: string
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

export enum TicketPurpose {
    ENTERPRISE = 'enterprise',
    YEARLY_TO_MONTHLY = 'yearlyToMonthly',
    MONTHLY_TO_YEARLY = 'monthlyToYearly',
    ERROR = 'error',
    CONTACT_US = 'contactUs',
}

export type BillingBanner = {
    description: string | JSX.Element
    type: AlertType
}

export type ProductData = {
    [key: string]: string
}
export interface ErrorResponse {
    response?: {
        data?: {
            error?: {
                msg: string
            }
        }
    }
    error?: {
        message: string
    }
}
