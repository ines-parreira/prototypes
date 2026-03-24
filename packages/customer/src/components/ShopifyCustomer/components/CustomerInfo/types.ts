import type { ReactNode } from 'react'

import type { DateFormatType, TimeFormatType } from '@repo/utils'

import type {
    EmailMarketingConsentData,
    PurchaseSummaryData,
    ShopperEcommerceData,
    SmsMarketingConsentData,
} from '../../types'

export type {
    EmailMarketingConsentData,
    PurchaseSummaryData,
    ShopperData,
    ShopperEcommerceData,
    SmsMarketingConsentData,
} from '../../types'

export type SectionKey =
    | 'customer'
    | 'defaultAddress'
    | 'emailMarketingConsent'
    | 'smsMarketingConsent'
    | 'addresses'

export type SectionPreferences = {
    fields: FieldPreference[]
}

export type OrderSectionKey =
    | 'orderDetails'
    | 'lineItems'
    | 'shipping'
    | 'shippingAddress'
    | 'billingAddress'

export type OrderSectionPreferences = {
    fields: FieldPreference[]
    sectionVisible?: boolean
}

export type OrderFieldPreferences = {
    sections: Partial<Record<OrderSectionKey, OrderSectionPreferences>>
}

export type OrderDetailsData = {
    id: number | string
    tags?: string
    note?: string
    created_at?: string
    invoice_url?: string
    discount_codes?: Array<{ code: string; amount: string; type: string }>
    metafields?: unknown[]
    fulfillments?: Array<{
        tracking_url?: string | null
        tracking_number?: string | null
    }> | null
    shipping_address?: {
        name?: string
        address1?: string | null
        address2?: string | null
        city?: string | null
        country?: string | null
        province?: string | null
        province_code?: string | null
        zip?: string | null
    } | null
    billing_address?: {
        name?: string
        address1?: string | null
        address2?: string | null
        city?: string | null
        country?: string | null
        province?: string | null
        province_code?: string | null
        zip?: string | null
    } | null
    shipping_lines?: Array<{ code?: string; [key: string]: unknown }> | null
    total_shipping_price?: string
    currency?: string
}

export type FieldRenderContext = {
    purchaseSummary: PurchaseSummaryData | undefined
    shopper: ShopperEcommerceData | undefined
    dateFormat: DateFormatType
    timeFormat: TimeFormatType
    integrationId: number | undefined
    externalId: string | undefined
    customerId: number | undefined
    ticketId: string | undefined
    emailMarketingConsent: EmailMarketingConsentData | undefined
    smsMarketingConsent: SmsMarketingConsentData | undefined
}

type BaseFieldConfig = {
    id: string
    label: string
    alwaysVisible?: boolean
}

export type ReadOnlyFieldConfig = BaseFieldConfig & {
    type: 'readonly'
    getValue: (context: FieldRenderContext) => string | number | undefined
    formatValue?: (
        value: string | number | undefined,
        context: FieldRenderContext,
    ) => ReactNode
}

export type ComponentFieldConfig = BaseFieldConfig & {
    type: 'component'
    render: (context: FieldRenderContext) => ReactNode
    getValue: (context: FieldRenderContext) => string | number | undefined
    formatValue?: (
        value: string | number | undefined,
        context: FieldRenderContext,
    ) => ReactNode
}

export type FieldConfig = ReadOnlyFieldConfig | ComponentFieldConfig

export type FieldPreference = {
    id: string
    visible: boolean
}

export type ShopifyFieldPreferences = {
    fields: FieldPreference[]
    sections?: Partial<Record<SectionKey, SectionPreferences>>
}

export type OrderFieldRenderContext = {
    order: OrderDetailsData
    isDraftOrder: boolean | undefined
    integrationId: number | undefined
    ticketId: string | undefined
    storeName: string | undefined
    dateFormat: DateFormatType
    timeFormat: TimeFormatType
}

type BaseOrderFieldConfig = {
    id: string
    label: string
}

export type ReadOnlyOrderFieldConfig = BaseOrderFieldConfig & {
    type: 'readonly'
    getValue: (context: OrderFieldRenderContext) => string | number | undefined
    formatValue?: (
        value: string | number | undefined,
        context: OrderFieldRenderContext,
    ) => ReactNode
}

export type ComponentOrderFieldConfig = BaseOrderFieldConfig & {
    type: 'component'
    render: (context: OrderFieldRenderContext) => ReactNode
    getValue: (context: OrderFieldRenderContext) => string | number | undefined
    formatValue?: (
        value: string | number | undefined,
        context: OrderFieldRenderContext,
    ) => ReactNode
}

export type OrderFieldConfig =
    | ReadOnlyOrderFieldConfig
    | ComponentOrderFieldConfig

export type OrderDetailsFieldPreferences = {
    fields: FieldPreference[]
}

export type LeafTemplate = {
    path: string
    type: string
    title: string
    [key: string]: unknown
}
