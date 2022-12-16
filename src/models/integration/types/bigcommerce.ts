import {IntegrationType} from '../constants'

import {IntegrationBase} from './base'
import {OAuth2} from './misc'

export type BigCommerceIntegration = IntegrationBase & {
    type: IntegrationType.BigCommerce
    meta: BigCommerceIntegrationMeta
}

export type CreateOrderValidationResult =
    | null
    | undefined
    | {
          products?: boolean
          shippingAddress?: boolean
          checkout?: boolean
      }

export type BigCommerceIntegrationMeta = {
    oauth: OAuth2
    store_hash: string
    shop_display_name?: Maybe<string>
    sync_customer_notes?: boolean
    shop_domain?: Maybe<string>
    shop_phone?: string
    shop_id: number
    webhooks: Array<BigCommerceWebhook>
    shop_plan?: Maybe<string>
    import_state?: {
        customers: BigCommerceImportState
        products: BigCommerceImportState
        external_orders: BigCommerceImportState
    }
    need_scope_update?: boolean
    currency?: string
    available_currencies?: string[]
}

export type BigCommerceWebhook = {
    topic: string
    address: string
    webhook_id: number
}

type BigCommerceImportState = {
    is_over: boolean
    oldest_created_at: string
}

export type BigCommerceCart = {
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
    line_items: BigCommerceCartLineItems
    created_time: string
    updated_time: string
    locale: string
}

export type BigCommerceCartLineItem = {
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

export type BigCommerceCartLineItems = {
    physical_items: Array<BigCommerceCartLineItem>
    digital_items: Array<BigCommerceCartLineItem>
    gift_certificates: Array<any>
    custom_items: Array<any>
}

export type BigCommerceNestedCart = {
    data: BigCommerceCart
}

export type BigCommerceCustomer = {
    id: number
    email: string
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

/**
 * @url https://developer.bigcommerce.com/api-reference/dfbf31248722d-add-consignment-to-checkout#response-body
 */
export type BigCommerceCheckout = {
    id: string
    cart: BigCommerceCart
    billing_address: BigCommerceBillingAddress
    // The response returns an array of consignments if we have multiple shipping addresses,
    // but as we're only allowing to add a single shipping address, we are only interested in the
    // 0th index of `consignments` array
    consignments: [BigCommerceConsignment]
    taxes: Array<{name: string; amount: number}>
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

export type BigCommerceNestedCheckout = {
    data: BigCommerceCheckout
}

export type BigCommerceProduct = {
    id: number
    sku: string
    inventory_level: number
    inventory_tracking: string
    name: string
    created_at: string
    image_url: string
    options: Array<Record<string, any>>
    variants: BigCommerceProductVariant[]
}

export type BigCommerceProductVariant = {
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

export type BigCommerceShippingOption = {
    id: string
    description: string
    cost: number
    image_url: string
    transit_time: string
    additional_description: string
    type: string
}

export type BigCommerceConsignment = {
    id: string
    address: BigCommerceBillingAddress
    line_item_ids: Array<string>
    available_shipping_options: Array<BigCommerceShippingOption>
    selected_shipping_option: Maybe<BigCommerceShippingOption>
}

/**
 * @url https://developer.bigcommerce.com/api-reference/dfbf31248722d-add-consignment-to-checkout#request-body
 */
export type BigCommerceCreateConsignmentPayload = {
    address: BigCommerceCustomerAddress
    line_items: Array<{
        item_id: BigCommerceCartLineItems['physical_items'][number]['id']
        quantity: number
    }>
}

export type BigCommerceUpsertConsignmentPayload =
    | BigCommerceCreateConsignmentPayload
    | {shipping_option_id: string}

export enum BigCommerceActionType {
    CreateOrder = 'bigcommerceCreateOrder',
}

export enum OrderStatusIDType {
    incomplete = 0,
    pending = 1,
    shipped = 2,
    partially_shipped = 3,
    refunded = 4,
    cancelled = 5,
    declined = 6,
    awaiting_payment = 7,
    awaiting_pickup = 8,
    awaiting_shipment = 9,
    completed = 10,
    awaiting_fulfillment = 11,
    manual_verification_required = 12,
    disputed = 13,
    partially_refunded = 14,
}

export enum OrderPaymentMethodType {
    credit_card = 'Credit Card',
    cash = 'Cash',
    test_payment_gateway = 'Test Payment Gateway',
    manual = 'Manual',
}
