// @flow

// List of non-fractional currencies (zero-decimal currencies). Source: https://stripe.com/docs/currencies#zero-decimal
// Supported currencies on Shopify:
// https://help.shopify.com/en/manual/payments/shopify-payments/multi-currency#supported-currencies
export const NON_FRACTIONAL_CURRENCIES = [
    'BIF',
    'CLP',
    'DJF',
    'GNF',
    'JPY',
    'KMF',
    'KRW',
    'MGA',
    'PYG',
    'RWF',
    'UGX',
    'VND',
    'VUV',
    'XAF',
    'XOF',
    'XPF',
]

export const FinancialStatus = Object.freeze({
    PENDING: 'pending',
    AUTHORIZED: 'authorized',
    PARTIALLY_PAID: 'partially_paid',
    PAID: 'paid',
    PARTIALLY_REFUNDED: 'partially_refunded',
    REFUNDED: 'refunded',
    VOIDED: 'voided',
})

export const FulfillmentStatus = Object.freeze({
    FULFILLED: 'fulfilled',
    PARTIAL: 'partial',
    RESTOCKED: 'restocked',
})

export type FinancialStatusType = $Values<typeof FinancialStatus>
export type FulfillmentStatusType = $Values<typeof FulfillmentStatus> | null

export type DiscountType = 'percentage' | 'fixed_amount' | 'shipping'

export type TaxLine = {
    title: string,
    rate: number,
    price: string,
}

export type AppliedDiscount = {
    title: string,
    description?: string,
    value: string,
    value_type: DiscountType,
    amount: string,
}

export type Discount = {
    code: string,
    type: DiscountType,
    amount: string,
}

export type Properties = {
    name: string,
    value: string,
}

export type LineItem = {
    variant_id: ?number,
    product_id: ?number,
    title: string,
    variant_title: ?string,
    sku: ?string,
    vendor: ?string,
    quantity: number,
    requires_shipping: boolean,
    taxable: boolean,
    gift_card: boolean,
    fulfillment_service: string,
    grams: number,
    tax_lines: TaxLine[],
    applied_discount?: AppliedDiscount,
    total_discount?: string,
    name: string,
    properties: Properties[],
    custom?: boolean,
    price: string,
    admin_graphql_api_id: string,
    product_exists: boolean,
}

export type Address = {
    first_name: ?string,
    address1: ?string,
    phone: ?string,
    city: ?string,
    zip: ?string,
    province: ?string,
    country: string,
    last_name: ?string,
    address2: ?string,
    company: ?string,
    latitude?: ?number,
    longitude?: ?number,
    name: string,
    country_code: string,
    province_code: ?string,
}

export type ShippingLine = {
    title: string,
    custom: boolean,
    handle: string,
    price: string,
}

export type Customer = {
    id: number,
    email: string,
    accepts_marketing: boolean,
    created_at: string,
    updated_at: string,
    first_name: ?string,
    last_name: ?string,
    orders_count: number,
    state: 'disabled' | 'invited' | 'enabled' | 'declined',
    total_spent: string,
    last_order_id: ?number,
    note: ?string,
    verified_email: boolean,
    tax_exempt: boolean,
    phone: ?string,
    tags: string,
    last_order_name: ?string,
    currency: string,
    accepts_marketing_updated_at: string,
    marketing_opt_in_level:
        | 'single_opt_in'
        | 'confirmed_opt_in'
        | 'unknown'
        | null,
    admin_graphql_api_id: string,
    default_address: Address,
}

export type DraftOrder = {
    id: number,
    note: string | null,
    email: string,
    taxes_included: boolean,
    currency: string,
    invoice_sent_at: ?string,
    created_at: string,
    updated_at: string,
    tax_exempt: boolean,
    completed_at: ?string,
    name: string,
    status: 'open' | 'invoice_sent' | 'completed',
    line_items: LineItem[],
    shipping_address: Address,
    billing_address: Address,
    invoice_url: string,
    applied_discount: ?AppliedDiscount,
    order_id: ?number,
    shipping_line: ?ShippingLine,
    tax_lines: TaxLine[],
    tags: string,
    note_attributes: Properties[],
    total_price: string,
    subtotal_price: string,
    total_tax: string,
    admin_graphql_api_id: string,
    customer: Customer,
}

export type PollingConfig = {
    retry_after: number,
    location: string,
}

export type DiscountAllocation = {
    amount: string,
    discount_application_index: number,
}

export type OrderLineItem = LineItem & {
    total_discounts: string,
    discount_allocations: DiscountAllocation[],
}

export type DiscountApplication = {
    type: 'manual' | 'script' | 'discount_code',
    title: string,
    description: string,
    value: string,
    value_type: DiscountType,
    allocation_method: 'across' | 'each' | 'one',
    target_selection: 'all' | 'entitled' | 'explicit',
    target_type: 'line_item' | 'shipping_line',
}

export type Order = {
    id: number,
    line_items: OrderLineItem[],
    financial_status: FinancialStatusType,
    fulfillment_status: FulfillmentStatusType,
    note: string,
    tags: string,
    customer?: Customer,
    shipping_address: Address,
    billing_address: Address,
    discount_codes: Discount[],
    shipping_lines: ShippingLine[],
    total_line_items_price: string,
    total_discounts: string,
    subtotal_price: string,
    total_tax: string,
    total_price: string,
    taxes_included: boolean,
    discount_applications: DiscountApplication[],
    refunds: Refund[],
}

export type Image = {
    id: number,
    alt: ?string,
    src: string,
}

export type Variant = {
    id: number,
    sku: string,
    price: string,
    title: string,
    image_id: ?number,
    option1: ?string,
    option2: ?string,
    option3: ?string,
    taxable: boolean,
    tax_code?: string,
    requires_shipping: boolean,
}

export type Product = {
    id: number,
    title: string,
    created_at: string,
    image: ?Image,
    images: Array<Image>,
    variants: Variant[],
}

export type DraftOrderInvoice = {
    to?: string,
    from?: string,
    bcc?: string[],
    subject?: string,
    custom_message?: string,
}

export type RefundLineItem = {
    id: number,
    quantity: number,
    line_item_id: number,
    location_id: number,
    restock_type: 'legacy_restock' | 'no_restock' | 'cancel' | 'return',
    subtotal: number,
    total_tax: number,
}

export type Transaction = {
    id: number,
    order_id: number,
    kind:
        | 'authorization'
        | 'capture'
        | 'sale'
        | 'void'
        | 'refund'
        | 'suggested_refund',
    gateway: string,
    status: 'pending' | 'failure' | 'success' | 'error',
    message: ?string,
    created_at: string,
    test: boolean,
    authorization: string,
    location_id: ?number,
    user_id: ?number,
    parent_id: number,
    processed_at: string,
    device_id: ?number,
    receipt: ?{
        testcase: boolean,
        authorization: string,
    },
    error_code:
        | 'incorrect_number'
        | 'invalid_number'
        | 'invalid_expiry_date'
        | 'invalid_cvc'
        | 'expired_card'
        | 'incorrect_cvc'
        | 'incorrect_zip'
        | 'incorrect_address'
        | 'card_declined'
        | 'processing_error'
        | 'call_issuer'
        | 'pick_up_card',
    source_name: string,
    amount: string,
    currency: string,
    admin_graphql_api_id: string,
}

export type OrderAdjustment = {
    id: number,
    order_id: number,
    refund_id: number,
    amount: string,
    tax_amount: string,
    kind: string,
    reason: string,
}

export type Refund = {
    id: number,
    order_id: number,
    created_at: string,
    note: string,
    user_id: number,
    processed_at: string,
    restock: boolean,
    admin_graphql_api_id: string,
    refund_line_items: RefundLineItem[],
    transactions: Transaction[],
    order_adjustments: OrderAdjustment[],
}

export type RefundOrderPayload = {
    restock: boolean,
    notify: boolean,
    note?: string,
    discrepancy_reason: 'restock' | 'damage' | 'customer' | 'other',
    shipping?: {
        full_refund?: boolean,
        amount: string,
        tax: string,
        maximum_refundable: string,
    },
    refund_line_items: RefundLineItem[],
    transactions?: Transaction[],
    currency?: string,
}

export type CancelOrderPayload = {
    amount?: string,
    currency?: string,
    reason?: 'customer' | 'inventory' | 'fraud' | 'declined' | 'other',
    email?: boolean,
    refund?: RefundOrderPayload,
}

export type PriceSet = {
    shop_money: MoneyAmount,
    presentment_money: MoneyAmount,
}

export type MoneyAmount = {
    amount: string,
    currency_code: string,
}
