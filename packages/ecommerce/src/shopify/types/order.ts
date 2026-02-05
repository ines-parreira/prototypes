import type { FinancialStatus, FulfillmentStatus } from './status'

export type OrderLineItem = {
    id: number
    title: string
    quantity: number
    price: string
    product_id: number | null
    variant_id: number | null
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

type FinancialStatusValue =
    | 'pending'
    | 'authorized'
    | 'partially_paid'
    | 'paid'
    | 'partially_refunded'
    | 'refunded'
    | 'voided'

type FulfillmentStatusValue = 'fulfilled' | 'partial' | 'restocked'

export type OrderCardLineItem = {
    title: string
    product_id: number | null | undefined
    variant_id: number | null | undefined
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
}
