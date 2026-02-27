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
    occurredAt?: string | null
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

export type OrderLineItem = {
    id: number
    title: string
    quantity: number
    price: string
    product_id: number | null
    variant_id: number | null
    product_exists?: boolean
}

export type FinancialStatus =
    | 'pending'
    | 'authorized'
    | 'partially_paid'
    | 'paid'
    | 'partially_refunded'
    | 'refunded'
    | 'voided'

export type FulfillmentStatus = 'fulfilled' | 'partial' | 'restocked'

export type OrderFulfillment = {
    tracking_url?: string | null
    tracking_number?: string | null
}

export type OrderData = {
    id: number | string
    order_number: number | string
    name: string
    created_at: string
    updated_at: string
    currency: string
    total_price: string
    subtotal_price?: string
    total_tax?: string
    total_shipping_price?: string
    financial_status: FinancialStatus
    fulfillment_status: FulfillmentStatus | null
    line_items: OrderLineItem[]
    customer: ShopperData
    tags?: string
    note?: string
    order_status_url?: string
    invoice_url?: string
    fulfillments?: OrderFulfillment[] | null
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
