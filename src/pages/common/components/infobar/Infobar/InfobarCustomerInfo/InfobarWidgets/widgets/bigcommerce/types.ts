export enum BigCommerceActionType {
    CreateOrder = 'bigCommerceCreateOrder',
}

export type Customer = {
    id: number
    email: string
}

export type LineItem = {
    quantity: number
    product_id: number
}

export type BigCommercePayload = {
    customer_id: number
    line_items: Array<LineItem>
}

export type BigCommerceResponse = {
    id: string
}

export type Variant = {
    id: number
    sku: string
    price: string
    image_url: string
    product_id: number
    inventory_level: number
    options: Array<Record<string, any>>
}

export type Product = {
    id: number
    sku: string
    inventory_level: number
    name: string
    created_at: string
    image_url: string
    options: Array<Record<string, any>>
    handle?: string
    variants: Variant[]
}

export enum BigCommerceCustomerAddressType {
    Residential = 'residential',
    Commercial = 'commercial',
}

export type BigCommerceCustomerAddress = {
    id: number
    email: string
    first_name: string
    last_name: string
    address1: string
    address2: Maybe<string>
    address_type: BigCommerceCustomerAddressType
    city: string
    company: Maybe<string>
    country: string
    country_code: string
    customer_id: number
    phone: Maybe<string>
    postal_code: Maybe<string>
    state_or_province: Maybe<string>
}
