import {IntegrationType} from '../constants'

import {IntegrationBase} from './base'
import {OAuth2} from './misc'

export type BigCommerceIntegration = IntegrationBase & {
    type: IntegrationType.BigCommerce
    meta: BigCommerceIntegrationMeta
}

export type CreateOrderValidationResult = {
    products: boolean
    shippingAddress: boolean
    checkout: boolean
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
    currency: string
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
    // Sum of cart line-item amounts before cart-level discounts, coupons, or taxes are applied.
    base_amount: number
    // Discounted amount
    discount_amount: number
    // Sum of cart line-item amounts minus cart-level discounts and coupons including tax.
    cart_amount_inc_tax: number
    // Sum of cart line-item amounts minus cart-level discounts and coupons excluding tax.
    cart_amount_ex_tax: number
    // Sum of cart line-item amounts minus cart-level discounts and coupons. This amount includes taxes (where applicable).
    cart_amount: number
    coupons: Array<BigCommerceCoupon>
    discounts: Array<BigCommerceDiscount>
    line_items: BigCommerceCartLineItems
    created_time: string
    updated_time: string
    locale: string
}

export type BigCommerceDiscount = {id: string; discounted_amount: number}

export type BigCommerceCoupon = {
    id: number
    code: string
    coupon_type: string
    discounted_amount: number
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
    discounts: Array<BigCommerceDiscount>
    coupons: Array<any>
    discount_amount: number
    coupon_amount: number
    original_price: number
    options: (
        | {name: string; nameId: number; value: string; valueId: number}
        // Sometimes BC just feels like returning snake_case
        | {name: string; name_id: number; value: string; value_id: number}
    )[]
    list_price: number
    sale_price: number
    extended_list_price: number
    extended_sale_price: number
    is_require_shipping: boolean
    is_mutable: boolean
}

export type BigCommerceCustomCartLineItem = {
    extended_list_price: number
    id: string
    image_url: string
    list_price: number
    name: string
    quantity: number
    sku: string
}

export type BigCommerceCartLineItems = {
    physical_items: Array<BigCommerceCartLineItem>
    digital_items: Array<BigCommerceCartLineItem>
    custom_items: Array<BigCommerceCustomCartLineItem>
    gift_certificates: Array<any>
}

export type BigCommerceNestedCart = {
    data: BigCommerceCart
}

export type BigCommerceCustomer = {
    id: number
    email: string
}

export type BigCommerceBillingAddress = {
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
    consignments: Array<BigCommerceConsignment>
    taxes: Array<BigCommerceTaxCheckout>
    coupons: Array<BigCommerceCoupon>
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

export type BigCommerceTaxCheckout = {
    name: string
    amount: number
}

export type BigCommerceNestedCheckout = {
    data: BigCommerceCheckout
}

export type BigCommerceCartRedirect = {
    data: string
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
    modifiers?: BigCommerceProductModifiers[]
    variants: BigCommerceProductVariant[]
    calculated_price: number
    availability: 'available' | 'disabled'
}

export interface BigCommerceProductModifiersBase<
    ValueData extends Record<string, unknown> | null
    // Type extends
    //     | 'checkbox' // Show checkbox component
    //     | 'swatch' // Show dropdown with colors
    //     | 'radio_buttons' // Show dropdown
    //     | 'rectangles' // Show dropdown
    //     | 'dropdown' // Show dropdown
    //     | 'product_list' // Show dropdown
    //     | 'product_list_with_images' // Show dropdown
    //     | 'date' // Not used
    //     | 'file' // Not used
    //     | 'text' // Not used
    //     | 'multi_line_text' // Not used
    //     | 'numbers_only_text', // Not used
> {
    id: number
    display_name: string
    name: string
    required: boolean
    sort_order: number
    product_id: number
    // type: Type
    // config: Config
    option_values: Array<{
        id: number
        option_id: number
        is_default: boolean
        label: string
        sort_order: number
        value_data: ValueData
    }>
}

export const bigCommerceProductCheckboxModifierTypes = ['checkbox'] as const

export interface BigCommerceProductCheckboxModifier
    extends BigCommerceProductModifiersBase<{checked_value: boolean}> {
    type: typeof bigCommerceProductCheckboxModifierTypes[number]
    config: {checked_by_default: boolean; checkbox_label: string}
}

export const bigCommerceProductSwatchModifierTypes = ['swatch'] as const

export interface BigCommerceProductSwatchModifier
    extends BigCommerceProductModifiersBase<
        | {colors: [string] | [string, string] | [string, string, string]}
        | {image_url: string}
    > {
    type: typeof bigCommerceProductSwatchModifierTypes[number]
    config: []
}

export const bigCommerceProductSelectModifierTypes = [
    'radio_buttons',
    'rectangles',
    'dropdown',
    'product_list',
    'product_list_with_images',
] as const

export interface BigCommerceProductSelectModifier
    extends BigCommerceProductModifiersBase<null> {
    type: typeof bigCommerceProductSelectModifierTypes[number]
    config: []
}

export type BigCommerceProductModifiers =
    | BigCommerceProductCheckboxModifier
    | BigCommerceProductSwatchModifier
    | BigCommerceProductSelectModifier

export type BigCommerceCustomProduct = {
    id?: Maybe<string>
    name: string
    sku: Maybe<string>
    list_price: number
    quantity: number
    extended_list_price?: Maybe<number>
    image_url?: Maybe<string>
}

export type BigCommerceProductVariant = {
    id: number
    sku: string
    price: string | null
    image_url: string
    product_id: number
    inventory_level: number
    options: Array<Record<string, any>>
    calculated_price: number
}

export type BigCommerceProductsListType = Map<
    number | string,
    BigCommerceProduct | BigCommerceCustomProduct
>

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

// Errors

// Errors treated in the Create Order Modal
export interface BigCommerceErrorList {
    global: Maybe<string> // Global Error => display a generic error message in a separate popup & close the modal
    modal: Map<string, string | null> // Modal Errors => display the errors at the top of the modal
    lineItem: Map<string, string | null> // Line Item Errors => display the errors at the Line Item level
    component: Map<string, string | null> // Component Errors => display the errors at the component level
}

export class BigCommerceGeneralError extends Error {
    public message: string
    public status: Maybe<number>

    constructor(message: string, status: Maybe<number> = null) {
        super()
        this.message = message
        this.status = status
    }
}

export enum BigCommerceGeneralErrorMessage {
    rateLimitingError = 'The operation cannot be completed. You have too many queued requests at the moment. Please wait a moment and try again.',
    defaultError = 'An unexpected error occurred. Please try again later.',
}

export class ProductModifiersChangedError extends Error {
    public product: BigCommerceProduct

    constructor(product: BigCommerceProduct) {
        super()
        this.product = product
    }
}

export class BigCommerceLineItemError extends Error {
    public message: string

    constructor(message: string) {
        super()
        this.message = message
    }
}

export enum BigCommerceLineItemErrorMessage {
    defaultAddLineItemError = 'Product could not be added to cart.',
    defaultUpdateLineItemError = 'Product could not be updated.',
    defaultAddDiscountLineItemError = 'Product discount could not be applied.',
    defaultRemoveDiscountLineItemError = 'Product discount could not be removed.',
    defaultRemoveLineItemError = 'Product could not be removed from cart.',
    onlyOfflineAvailabilityError = 'Product cannot be purchased in the online store.',
    insufficientInventoryError = 'Insufficient inventory. Please adjust product quantity.',
    invalidQuantityError = 'Invalid quantity selected. Please adjust product quantity.',
}

export class BigCommerceCouponError extends Error {
    public message: string

    constructor(message: string) {
        super()
        this.message = message
    }
}

export enum BigCommerceCouponErrorMessage {
    defaultCouponError = 'An error occurred while processing your action.',
    defaultCurrencyError = 'Coupon cannot be applied. Coupons only apply to default currency.',
    minAmountOrderError = 'Coupon cannot be applied. Your order does not meet the minimum total for this coupon code to be applied.',
    invalidCodeError = 'Coupon cannot be applied. The coupon code you entered is not valid.',
    disabledCodeError = 'Coupon cannot be applied. The coupon code you entered has been disabled.',
    expiredCodeError = 'Coupon cannot be applied. The coupon code you entered expired.',
    usageLimitExceededError = 'Coupon cannot be applied. The coupon code you entered has reached usage limit.',
    invalidConditionError = "Coupon cannot be applied. The coupon code you entered couldn't be applied to any items in your order.",
}

export type BigCommerceCartErrorResponse = {
    error?: {
        data?: {
            cart?: Maybe<BigCommerceCart>
            updated_product?: Maybe<BigCommerceProduct>
        }
        msg?: Maybe<string>
    }
}

export type BigCommerceCartResponse =
    | {
          cart?: Maybe<BigCommerceCart>
      }
    | BigCommerceCartErrorResponse

export type BigCommerceNestedCartResponse =
    | {
          data?: {
              cart?: Maybe<BigCommerceCart>
          }
      }
    | BigCommerceCartErrorResponse

export type BigCommerceCheckoutErrorResponse = {
    error?: {
        data?: {
            checkout?: Maybe<BigCommerceCheckout>
        }
        msg?: Maybe<string>
    }
}

export type BigCommerceCheckoutResponse =
    | {
          checkout?: Maybe<BigCommerceCheckout>
      }
    | BigCommerceCheckoutErrorResponse

export type BigCommerceNestedCheckoutResponse =
    | {
          data?: {
              checkout?: Maybe<BigCommerceCheckout>
          }
      }
    | BigCommerceCheckoutErrorResponse
