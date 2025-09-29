import { Map } from 'immutable'

import { Product, ProductType } from 'models/billing/types'
import { AlertType } from 'pages/common/components/Alert/Alert'

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
    [ProductType.Convert]: CurrentUsagePerProduct | null
}

export enum PaymentType {
    Stripe = 'stripe',
    Shopify = 'shopify',
}

export enum PaymentIntentStatus {
    RequiresSource = 'requires_source',
    RequiresConfirmation = 'requires_source_action',
    RequiresPaymentMethod = 'requires_payment_method',
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

export enum TaxIdType {
    eu_vat = 'eu_vat',
    au_abn = 'au_abn',
    ca_gst_hst = 'ca_gst_hst',
    ca_pst_bc = 'ca_pst_bc',
    ca_pst_mb = 'ca_pst_mb',
    ca_pst_sk = 'ca_pst_sk',
    ca_qst = 'ca_qst',
}

export enum TaxIdVerificationStatus {
    Pending = 'pending',
    Verified = 'verified',
    Unverified = 'unverified',
    Unavailable = 'unavailable',
}

export type TaxId<Type extends TaxIdType = TaxIdType> = {
    type: Type
    value: string
    verification: TaxIdVerificationStatus
}

export type BillingContact = {
    email: string
    shipping: {
        address: {
            city: string
            country: string
            line1: string
            line2: string | null
            postal_code: string
            state?: string
        }
        name: string
        phone?: string | null
    }
}

export type BillingContactDetailResponse = {
    tax_ids?: Partial<{
        [key in TaxIdType]: TaxId<key>
    }>
} & BillingContact

export type BillingContactUpdatePayload = {
    tax_ids?: Partial<{
        [key in TaxIdType]: TaxId<key>['value']
    }>
} & BillingContact

export type Subscription = {
    prices: string[]
}

export type BillingImmutableState = Map<any, any>

export type BillingProducts = Product[]

export type ReduxBillingState = {
    contact?: BillingContact
    products: BillingProducts
    invoices: Invoice[]
}

export enum TicketPurpose {
    ENTERPRISE = 'enterprise',
    BILLING_FREQUENCY_DOWNGRADE = 'billingFrequencyDowngrade',
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

export enum VATCountries {
    AT = 'AT',
    BE = 'BE',
    BG = 'BG',
    CY = 'CY',
    CZ = 'CZ',
    DE = 'DE',
    DK = 'DK',
    EE = 'EE',
    ES = 'ES',
    FI = 'FI',
    FR = 'FR',
    GR = 'GR',
    HR = 'HR',
    HU = 'HU',
    IE = 'IE',
    IT = 'IT',
    LT = 'LT',
    LU = 'LU',
    LV = 'LV',
    MT = 'MT',
    NL = 'NL',
    PL = 'PL',
    PT = 'PT',
    RO = 'RO',
    SE = 'SE',
    SI = 'SI',
    SK = 'SK',
}
