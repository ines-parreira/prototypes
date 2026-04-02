import type { FinancialStatus, FulfillmentStatus } from './status'

export type MoneySet = {
    shop_money?: { amount: string; currency_code: string }
    presentment_money?: { amount: string; currency_code: string }
}

export type OrderLineItem = {
    id: number
    title: string
    quantity: number
    price: string
    price_set?: MoneySet
    current_quantity?: number
    sku?: string | null
    product_id?: number | null
    variant_id?: number | null
    product_exists?: boolean
}

export type OrderImage = {
    id?: number
    alt: string | null
    src: string
    variant_ids: number[]
}

export type OrderProduct = {
    id: number
    title: string
    image: OrderImage | null
    images: OrderImage[]
}

export type OrderData = {
    id: number | string
    name: string
    created_at: string
    updated_at: string
    currency: string
    total_price: string
    financial_status: FinancialStatus
    fulfillment_status: FulfillmentStatus | null
    line_items: OrderLineItem[]
}

export type FinancialStatusValue =
    | 'pending'
    | 'authorized'
    | 'partially_paid'
    | 'paid'
    | 'partially_refunded'
    | 'refunded'
    | 'voided'
    | 'expired'

export type FulfillmentStatusValue =
    | 'fulfilled'
    | 'partial'
    | 'restocked'
    | 'in_progress'
    | 'on_hold'
    | 'open'
    | 'partially_fulfilled'
    | 'pending_fulfillment'
    | 'scheduled'
    | 'unfulfilled'

export type OrderCardLineItem = {
    title: string
    product_id?: number | null
    variant_id?: number | null
}

export type OrderCardImage = {
    src: string
    variant_ids: number[]
}

export type OrderCardProduct = {
    image: OrderCardImage | null | undefined
    images: OrderCardImage[]
}

export type OrderCardOrder = {
    name: string
    currency: string
    total_price: string
    financial_status: FinancialStatusValue
    fulfillment_status: FulfillmentStatusValue | null
    line_items: OrderCardLineItem[]
    cancelled_at?: string | null
}

export type ShopifyProductData = {
    title: string
    // REST API format (schema_version: "2025-07")
    image?: {
        id?: number
        src: string
        alt: string | null
        variant_ids: number[]
    } | null
    images?: Array<{
        id?: number
        src: string
        alt: string | null
        variant_ids: number[]
    }>
    // GraphQL format (schema_version: "2025-07-graphql")
    featuredMedia?: {
        image?: { url: string; altText: string | null }
    } | null
    media?: {
        nodes: Array<{
            image?: { url: string; altText: string | null }
        }>
    }
}
