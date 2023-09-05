export type CustomerEcommerceData = {
    store: EcommerceStore
    shopper: Shopper
    orders: ShopperOrder[]
    addresses: ShopperAddress[]
}

export type EcommerceStore = {
    id: number
    uuid: string
    helpdesk_integration_id: number
    type: string
    url: string
    name: string
    display_name: string
    currencies: string[]
    default_currency: string
    created_datetime: string
    updated_datetime: string | null
    deleted_datetime: string | null
}

export type Shopper = {
    id: number
    external_id: string
    helpdesk_customer_id: number
    email_address: string | null
    phone_number: string | null
    first_name: string | null
    middle_name: string | null
    last_name: string | null
    birthdate: string | null
    status: string | null

    accepts_marketing_email: boolean
    accepts_marketing_sms: boolean
    created_datetime: string
    updated_datetime: string | null
    deleted_datetime: string | null
}

export type ShopperOrder = {
    id: number
    external_id: string
    billing_address: ShopperAddress
    shipping_address: ShopperAddress
    number: number
    name: string
    currency: string
    discount_codes: string[] | null
    discount_amount: number | null
    subtotal_amount: number | null
    shipping_amount: number | null
    tax_amount: number | null
    total_amount: number
    financial_status: string | null
    fulfillment_status: string | null
    line_items: LineItem[]
    created_datetime: string
    updated_datetime: string | null
    deleted_datetime: string | null
}

export type ShopperAddress = {
    id: number
    external_id: string
    preferred: boolean
    line_1: string
    line_2: string | null
    city: string
    state: string | null
    country: string
    zip_code: string
    last_name: string
    first_name: string
    phone_number: string | null
    created_datetime: string
    updated_datetime: string | null
    deleted_datetime: string | null
}

export type Product = {
    id: number
    external_id: string
    name: string
    description: string | null
    images: string[] | null
    tags: string[] | null
    sku: string
    barcode: string | null
    stock: number | null
    price: number
    currency: string
    taxable: boolean
    requires_shipping: boolean
    created_datetime: string
    updated_datetime: string | null
    deleted_datetime: string | null
}

export type LineItem = {
    id: number
    title: string | null
    taxable: boolean | null
    requires_shipping: boolean | null
    unit_price: number
    discount_amount: number | null
    discount_type: string | null
    discount_reason: string | null
    quantity: number
    total_amount: number
    product_options: Record<any, any> | null
    fulfilled_quantity: number | null
    product: Product
    created_datetime: string
    updated_datetime: string | null
    deleted_datetime: string | null
}
