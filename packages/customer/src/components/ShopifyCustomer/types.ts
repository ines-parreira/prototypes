import type { FullShopifyMetafield } from '@repo/ecommerce/shopify/components'

export type MoneyAmount = {
    amount: string
    currencyCode: string
}

export type PurchaseSummaryData = {
    id?: number
    customerId?: string
    numberOfOrders?: number
    amountSpent?: MoneyAmount
    lastOrderId?: string
}

export type EcommerceData = {
    id: string
    account_id: number
    created_datetime: string
    updated_datetime: string
    data: PurchaseSummaryData
    source_type: 'shopify'
    integration_id: number
    external_id: string
}

export type ShopperAddress = {
    id: number
    customer_id: number
    first_name: string
    last_name: string
    company: string | null
    address1: string
    address2: string | null
    city: string
    province: string
    country: string
    zip: string
    phone: string | null
    name: string
    province_code: string | null
    country_code: string
    country_name: string
    default: boolean
}

export type ShopperData = {
    id: number
    created_at: string
    updated_at: string
    first_name: string
    last_name: string
    state: string
    note: string
    verified_email: boolean
    multipass_identifier: string | null
    tax_exempt: boolean
    email: string
    phone: string | null
    currency: string
    addresses: ShopperAddress[]
    tax_exemptions: string[]
    admin_graphql_api_id: string
    default_address: ShopperAddress | null
    tags: string
    metafields: FullShopifyMetafield[]
}

export type ShopperEcommerceData = {
    id: string
    account_id: number
    created_datetime: string
    updated_datetime: string
    data: ShopperData
    source_type: 'shopify'
    integration_id: number
    external_id: string
    schema_version: string
    version: string
    relationships?: {
        shopper_identity_id?: string
    }
}

export type MoneySet = {
    shop_money?: { amount: string; currency_code: string }
    presentment_money?: { amount: string; currency_code: string }
    shopMoney?: { amount: string; currencyCode: string }
    presentmentMoney?: { amount: string; currencyCode: string }
}

export type OrderLineItem = {
    id: number
    title: string
    quantity: number
    price: string
    price_set?: MoneySet
    current_quantity?: number
    product_id: number | null
    variant_id: number | null
    product_exists?: boolean
    discount_allocations?: Array<{
        amount: string
        amount_set?: MoneySet
        discount_application_index: number
    }>
}

export type FinancialStatus =
    | 'pending'
    | 'authorized'
    | 'partially_paid'
    | 'paid'
    | 'partially_refunded'
    | 'refunded'
    | 'voided'
    | 'expired'

export type FulfillmentStatus =
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

export type OrderFulfillment = {
    tracking_url?: string | null
    tracking_number?: string | null
    shipment_status?: string | null
}

export type OrderShippingAddress = {
    name?: string
    address1?: string | null
    address2?: string | null
    city?: string | null
    country?: string | null
    country_code?: string
    province?: string | null
    province_code?: string | null
    zip?: string | null
}

export type OrderRefundLineItem = {
    id: number
    quantity: number
    line_item_id: number
    location_id?: number
    restock_type: 'legacy_restock' | 'no_restock' | 'cancel' | 'return'
    subtotal: number
    total_tax: number
}

export type OrderRefund = {
    id: number
    order_id: number
    created_at: string
    note: string | null
    processed_at: string
    refund_line_items: OrderRefundLineItem[]
    transactions: Array<{
        id: number
        amount: string
        kind: string
        status: string
    }>
}

export type OrderReturnLineItem = {
    line_item_id: number
    quantity: number
}

export type OrderReturn = {
    id: number
    status?: string
    closed_at?: string | null
    return_line_items: OrderReturnLineItem[]
}

export type OrderData = {
    id: number | string
    order_number: number | string
    name: string
    created_at: string
    updated_at: string
    currency: string
    presentment_currency?: string
    total_price: string
    total_price_set?: MoneySet
    subtotal_price?: string
    subtotal_price_set?: MoneySet
    total_line_items_price?: string
    total_tax?: string
    total_tax_set?: MoneySet
    total_discounts?: string
    total_discounts_set?: MoneySet
    total_shipping_price?: string
    total_shipping_price_set?: MoneySet | null
    current_total_price?: string
    current_total_price_set?: MoneySet
    current_subtotal_price?: string
    current_subtotal_price_set?: MoneySet
    current_total_tax?: string
    current_total_tax_set?: MoneySet
    current_total_discounts?: string
    current_total_discounts_set?: MoneySet
    current_shipping_price_set?: MoneySet
    financial_status: FinancialStatus
    fulfillment_status: FulfillmentStatus | null
    line_items: OrderLineItem[]
    customer: ShopperData
    tags?: string
    note?: string
    cancelled_at?: string | null
    order_status_url?: string
    invoice_url?: string
    fulfillments?: OrderFulfillment[] | null
    shipping_address?: OrderShippingAddress | null
    billing_address?: OrderShippingAddress | null
    discount_codes?: Array<{ code: string; amount: string; type: string }>
    shipping_lines?: Array<{ code?: string; [key: string]: unknown }> | null
    metafields?: FullShopifyMetafield[]
    refunds?: OrderRefund[]
    returns?: OrderReturn[]
}

export type EmailMarketingConsent = {
    state: string
    opt_in_level: string
    consent_updated_at: string
}

export type EmailMarketingConsentData = {
    customer_id?: number
    email_address?: string
    email_marketing_consent?: EmailMarketingConsent
}

export type SmsMarketingConsentData = {
    customer_id?: number
    phone?: string
    sms_marketing_consent?: EmailMarketingConsent
}

export type OrderEcommerceData = {
    id: string
    account_id: number
    created_datetime: string
    updated_datetime: string
    data: OrderData
    source_type: 'shopify'
    integration_id: number
    external_id: string
    relationships?: {
        shopper_identity?: string
    }
    schema_version?: string
    version?: string
}
