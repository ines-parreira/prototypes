export enum BigCommerceActionType {
    CreateOrder = 'bigCommerceCreateOrder',
}

export type BigCommerceNestedCart = {
    data: Cart
}

export type Customer = {
    id: number
    email: string
}

export type Cart = {
    id: string
    customer_id: number
    channel_id: number
    email: string
    currency: any
    tax_included: boolean
    base_amount: number
    discount_amount: number
    cart_amount: number
    coupons: Array<any>
    discounts: Array<any>
    line_items: LineItems
    created_time: string
    updated_time: string
    locale: string
}

type BigCommerceBillingAddress = {
    id: string
    first_name: string
    last_name: string
    email: string
    company: string
    address1: string
    address2: string
    city: string
    state_or_province: string
    state_or_province_code: string
    country: string
    country_code: string
    postal_code: string
    phone: string
    custom_fields: Array<any>
}

export type Checkout = {
    id: string
    cart: Cart
    billing_address: BigCommerceBillingAddress
    consignments: Array<any>
    taxes: Array<any>
    coupons: Array<any>
    order_id: any
    shipping_cost_total_inc_tax: number
    shipping_cost_total_ex_tax: number
    handling_cost_total_inc_tax: number
    handling_cost_total_ex_tax: number
    tax_total: number
    subtotal_inc_tax: number
    subtotal_ex_tax: number
    grand_total: number
    created_time: string
    updated_time: string
    customer_message: string
}

export type LineItem = {
    id: string
    parent_id: number | null
    variant_id: number
    product_id: number
    sku: string
    name: string
    url: string
    quantity: number
    taxable: boolean
    image_url: string
    discounts: Array<any>
    coupons: Array<any>
    discount_amount: number
    coupon_amount: number
    original_price: number
    list_price: number
    sale_price: number
    extended_list_price: number
    extended_sale_price: number
    is_require_shipping: boolean
    is_mutable: boolean
}

type LineItems = {
    physical_items: Array<LineItem>
    digital_items: Array<LineItem>
    gift_certificates: Array<any>
    custom_items: Array<any>
}

export type Product = {
    id: number
    sku: string
    inventory_level: number
    inventory_tracking: string
    name: string
    created_at: string
    image_url: string
    options: Array<Record<string, any>>
    variants: Variant[]
}

export type Variant = {
    id: number
    sku: string
    price: string | null
    image_url: string
    product_id: number
    inventory_level: number
    options: Array<Record<string, any>>
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

export type ShippingOption = {
    id: string
    description: string
    cost: number
    image_url: string
    transit_time: string
    additional_description: string
    type: string
}

export type Consignment = {
    id: string
    available_shipping_options: Array<ShippingOption>
    selected_shipping_option: Maybe<ShippingOption>
    shipping_cost_inc_tax: number // The shipping cost for this consignment including tax.
}

/**
 * @url https://developer.bigcommerce.com/api-reference/dfbf31248722d-add-consignment-to-checkout#request-body
 */
export type CreateConsignmentPayload = {
    address: BigCommerceCustomerAddress
    line_items: Array<{
        item_id: LineItems['physical_items'][number]['id']
        quantity: number
    }>
}

export type UpsertConsignmentPayload =
    | Array<CreateConsignmentPayload>
    | {shipping_option_id: string}

/**
 * @url https://developer.bigcommerce.com/api-reference/dfbf31248722d-add-consignment-to-checkout#response-body
 */
export type UpsertConsignmentResponse = {
    id: string
    // The response may return array of consignments, if we have multiple shipping addresses
    // but as we're only allowing to add single shipping address, we are only interested in the
    // 0th index of `consignments` array
    consignments: [Consignment]
}
