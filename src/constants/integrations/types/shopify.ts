export enum NonFractionalCurrency {
    Bif = 'BIF',
    Clp = 'CLP',
    Djf = 'DJF',
    Gnf = 'GNF',
    Jpy = 'JPY',
    Kmf = 'KMF',
    Krw = 'KRW',
    Mga = 'MGA',
    Pyg = 'PYG',
    Rwf = 'RWF',
    Ugx = 'UGX',
    Vnd = 'VND',
    Vuv = 'VUV',
    Xaf = 'XAF',
    Xof = 'XOF',
    Xpf = 'XPF',
}

export enum FinancialStatus {
    Pending = 'pending',
    Authorized = 'authorized',
    PartiallyPaid = 'partially_paid',
    Paid = 'paid',
    PartiallyRefunded = 'partially_refunded',
    Refunded = 'refunded',
    Voided = 'voided',
}

export enum FulfillmentStatus {
    Fulfilled = 'fulfilled',
    Partial = 'partial',
    Restocked = 'restocked',
}

export enum DiscountType {
    Percentage = 'percentage',
    FixedAmount = 'fixed_amount',
    Shipping = 'shipping',
}

export enum CustomerState {
    Disabled = 'disabled',
    Invited = 'invited',
    Enabled = 'enabled',
    Declined = 'declined',
}

enum CustomerMarketingLevel {
    SingleOptIn = 'single_opt_in',
    ConfirmedOptIn = 'confirmed_opt_in',
    Unknown = 'unknown',
}

export enum DraftStatus {
    Open = 'open',
    InvoiceSent = 'invoice_sent',
    Completed = 'completed',
}

export enum DiscountApplicationType {
    Manual = 'manual',
    Script = 'script',
    DiscountCode = 'discount_code',
}

export enum DiscountAllocationMethod {
    Across = 'across',
    Each = 'each',
    One = 'one',
}

export enum DiscountTargetSelection {
    All = 'all',
    Entitled = 'entitled',
    Explicit = 'explicit',
}

export enum DiscountTargetType {
    LineItem = 'line_item',
    ShippingLine = 'shipping_line',
}

export enum RestockType {
    LegacyRestock = 'legacy_restock',
    NoRestock = 'no_restock',
    Cancel = 'cancel',
    Return = 'return',
}

export enum TransactionKind {
    Authorization = 'authorization',
    Capture = 'capture',
    Sale = 'sale',
    Void = 'void',
    Refund = 'refund',
    SuggestedRefund = 'suggested_refund',
}

enum TransactionStatus {
    Pending = 'pending',
    Failure = 'failure',
    Success = 'success',
    Error = 'error',
}

enum TransactionErrorCode {
    IncorrectNumber = 'incorrect_number',
    InvalidNumber = 'invalid_number',
    InvaliedExpiryDate = 'invalid_expiry_date',
    InvalidCvc = 'invalid_cvc',
    ExpiredCard = 'expired_card',
    IncorrectCvc = 'incorrect_cvc',
    IncorrectZip = 'incorrect_zip',
    IncorrectAddress = 'incorrect_address',
    CardDeclined = 'card_declined',
    ProcessingError = 'processing_error',
    CallIssuer = 'call_issuer',
    PickUpCard = 'pick_up_card',
}

enum DiscrepancyReason {
    Restock = 'restock',
    Damage = 'damage',
    Customer = 'customer',
    Other = 'other',
}

export enum CancelReason {
    Customer = 'customer',
    Inventory = 'inventory',
    Fraud = 'fraud',
    Declined = 'declined',
    Other = 'other',
}

export enum InventoryManagement {
    Shopify = 'shopify',
}

export enum EditOrderAction {
    AddVariant = 'addVariant',
    AddCustomVariant = 'addCustomVariant',
    RemoveVariant = 'removeVariant',
    ChangeLineItem = 'changeLineItem',
    ApplyItemDiscount = 'applyItemDiscount',
    RemoveItemDiscount = 'removeItemDiscount',
}

export type TaxLine = {
    title: string
    rate: number
    price: string
}

export type AppliedDiscount = {
    title: string
    description?: string
    value: string
    value_type: DiscountType
    amount: string
    currency_code?: string
}

export type Discount = {
    code: string
    type: DiscountType
    amount: string
}

export type Properties = {
    name: string
    value: string
}

export type LineItem = {
    variant_id: Maybe<number>
    product_id: Maybe<number>
    title: string
    variant_title: Maybe<string>
    sku: Maybe<string>
    vendor: Maybe<string>
    quantity: number
    requires_shipping: boolean
    taxable: boolean
    gift_card: boolean
    fulfillment_service: string
    grams: number
    tax_lines: TaxLine[]
    applied_discount?: AppliedDiscount
    total_discount?: string
    name: string
    properties: Properties[]
    custom?: boolean
    price: string
    admin_graphql_api_id: string
    product_exists: boolean
}

export type Address = {
    first_name: Maybe<string>
    address1: Maybe<string>
    phone: Maybe<string>
    city: Maybe<string>
    zip: Maybe<string>
    province: Maybe<string>
    country: string
    last_name: Maybe<string>
    address2: Maybe<string>
    company: Maybe<string>
    latitude?: Maybe<number>
    longitude?: Maybe<number>
    name: string
    country_code: string
    province_code: Maybe<string>
}

export type ShippingLine = {
    title: string
    custom: boolean
    handle: string
    price: string
}

export type EditOrderPayload = {
    calculatedOrderId: string
    total_line_items_price: string
    current_total_tax: string
    current_total_price: string
    paid_by_customer: string
    amount_to_collect: string
    has_changes: boolean
}

export type Customer = {
    id: number
    email: string
    accepts_marketing: boolean
    created_at: string
    updated_at: string
    first_name: Maybe<string>
    last_name: Maybe<string>
    orders_count: number
    state: CustomerState
    total_spent: string
    last_order_id: Maybe<number>
    note: Maybe<string>
    verified_email: boolean
    tax_exempt: boolean
    phone: Maybe<string>
    tags: string
    last_order_name: Maybe<string>
    currency: string
    accepts_marketing_updated_at: string
    marketing_opt_in_level: CustomerMarketingLevel | null
    admin_graphql_api_id: string
    default_address: Address
}

export type DraftOrder = {
    id: number
    note: string | null
    email: string
    taxes_included: boolean
    currency: string
    invoice_sent_at: Maybe<string>
    created_at: string
    updated_at: string
    tax_exempt: boolean
    completed_at: Maybe<string>
    name: string
    status: DraftStatus
    line_items: LineItem[]
    shipping_address: Address
    billing_address: Address
    invoice_url: string
    applied_discount: Maybe<AppliedDiscount>
    order_id: Maybe<number>
    shipping_line: Maybe<ShippingLine>
    tax_lines: TaxLine[]
    tags: string
    note_attributes: Properties[]
    total_price: string
    subtotal_price: string
    total_tax: string
    admin_graphql_api_id: string
    customer: Customer
}

export type PollingConfig = {
    retry_after: number
    location: string
}

export type DiscountAllocation = {
    amount: string
    discount_application_index: number
}

export type OrderLineItem = LineItem & {
    total_discounts: string
    discount_allocations: DiscountAllocation[]
}

export type DiscountApplication = {
    type: DiscountApplicationType
    title: string
    description: string
    value: string
    value_type: DiscountType
    allocation_method: DiscountAllocationMethod
    target_selection: DiscountTargetSelection
    target_type: DiscountTargetType
}

export type Order = {
    id: number
    line_items: OrderLineItem[]
    financial_status: FinancialStatus
    fulfillment_status: FulfillmentStatus | null
    note: string
    tags: string
    customer?: Customer
    shipping_address: Address
    billing_address: Address
    discount_codes: Discount[]
    shipping_lines: ShippingLine[]
    total_line_items_price: string
    total_discounts: string
    subtotal_price: string
    total_tax: string
    total_price: string
    taxes_included: boolean
    discount_applications: DiscountApplication[]
    refunds: Refund[]
}

export type Image = {
    id?: number
    alt: Maybe<string>
    src: string
}

export type Variant = {
    id: number
    admin_graphql_api_id: string
    sku: Maybe<string>
    price: string
    title: string
    image_id: Maybe<number>
    option1: Maybe<string>
    option2: Maybe<string>
    option3: Maybe<string>
    taxable: boolean
    tax_code?: string
    requires_shipping: boolean
    inventory_quantity: number
    inventory_management: Maybe<InventoryManagement>
}

export type Product = {
    id: number
    title: string
    created_at: string
    image: Maybe<Image>
    images: Array<Image>
    variants: Variant[]
}

export type DraftOrderInvoice = {
    to?: string
    from?: string
    bcc?: string[]
    subject?: string
    custom_message?: string
}

export type RefundLineItem = {
    id: number
    quantity: number
    line_item_id: number
    location_id: number
    restock_type: RestockType
    subtotal: number
    total_tax: number
}

export type Transaction = {
    id: number
    order_id: number
    kind: TransactionKind
    gateway: string
    status: TransactionStatus
    message: Maybe<string>
    created_at: string
    test: boolean
    authorization: string
    location_id: Maybe<number>
    user_id: Maybe<number>
    parent_id: number
    processed_at: string
    device_id: Maybe<number>
    receipt: Maybe<{
        testcase: boolean
        authorization: string
    }>
    error_code: TransactionErrorCode
    source_name: string
    amount: string
    currency: string
    admin_graphql_api_id: string
}

export type OrderAdjustment = {
    id: number
    order_id: number
    refund_id: number
    amount: string
    tax_amount: string
    kind: string
    reason: string
}

export type Refund = {
    id: number
    order_id: number
    created_at: string
    note: string
    user_id: number
    processed_at: string
    restock: boolean
    admin_graphql_api_id: string
    refund_line_items: RefundLineItem[]
    transactions: Transaction[]
    order_adjustments: OrderAdjustment[]
}

export type Edit_to_perform = {
    action: string
    calculated_order_id: string
    variant_id?: string
    line_item_id?: string
    quantity?: number
    title?: string
    taxable?: string
    restock?: boolean
    requires_shipping?: string
    discount_item_id?: string
    price?: {
        amount: string
        currency_code: string
    }
    discount?: {
        description: string
        fixed_value: {
            amount: string
            currency_code: string
        }
        percent_value: string
    }
}
export type RefundOrderPayload = {
    restock: boolean
    notify: boolean
    note?: string
    discrepancy_reason: DiscrepancyReason
    shipping?: {
        full_refund?: boolean
        amount: string
        tax: string
        maximum_refundable: string
    }
    refund_line_items: RefundLineItem[]
    transactions?: Transaction[]
    currency?: string
}

export type CancelOrderPayload = {
    amount?: string
    currency?: string
    reason?: CancelReason
    email?: boolean
    refund?: RefundOrderPayload
}

export type PriceSet = {
    shop_money: MoneyAmount
    presentment_money: MoneyAmount
}

export type MoneyAmount = {
    amount: string
    currency_code: string
}
