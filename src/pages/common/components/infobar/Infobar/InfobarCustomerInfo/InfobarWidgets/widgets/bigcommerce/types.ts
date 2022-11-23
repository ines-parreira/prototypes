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
