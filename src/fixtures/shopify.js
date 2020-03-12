import * as Shopify from '../constants/integrations/shopify'
import type {IntegrationDataItem} from '../models/integration'
import {INTEGRATION_DATA_ITEM_TYPE_PRODUCT, SHOPIFY_INTEGRATION_TYPE} from '../constants/integration'

export const shopifyImageFixture = (): Shopify.Image => ({
    id: 1,
    alt: 'Alt',
    src: 'src',
})

export const shopifyVariantFixture = (
    {
        id = 1,
        sku = '11111',
        title = 'Variant 1',
        price = '9.99',
    } = {}
): Shopify.Variant => ({
    id,
    sku,
    price,
    title,
    image_id: 1,
    option1: null,
    option2: null,
    option3: null,
    taxable: true,
    requires_shipping: true,
})

export const shopifyProductFixture = (
    {
        id = 1,
        title = 'Product 1',
        variants = [shopifyVariantFixture()],
    } = {}
): Shopify.Product => ({
    id,
    title,
    created_at: '2020-01-01 00:00:00.000000',
    image: shopifyImageFixture(),
    images: [shopifyImageFixture()],
    variants,
})

export const integrationDataItemProductFixture = (
    {
        data = shopifyProductFixture(),
    } = {}
): IntegrationDataItem<Shopify.Product> => ({
    id: 1,
    integration_id: 1,
    integration_type: SHOPIFY_INTEGRATION_TYPE,
    external_id: '123',
    item_type: INTEGRATION_DATA_ITEM_TYPE_PRODUCT,
    search: 'foo',
    data,
    created_datetime: '2020-02-06 15:15:15.123456',
    updated_datetime: '2020-02-06 15:15:15.123456',
    deleted_datetime: null,
})

export const shopifyPriceSetFixture = (
    {
        amount = '1.00',
        currencyCode = 'USD',
    } = {}
): Shopify.PriceSet => ({
    shop_money: {
        amount,
        currency_code: currencyCode,
    },
    presentment_money: {
        amount,
        currency_code: currencyCode,
    },
})

export const shopifyOrderFixture = (
    {
        shippingLines = [],
    } = {}
): Shopify.Order => ({
    id: 1894175539223,
    name: '#1684',
    note: 'ahahah??',
    tags: '',
    test: false,
    email: 'apu@gorgias.com',
    phone: null,
    token: '46a2ba4414e9539325b3a03975da8657',
    app_id: 1354745,
    number: 684,
    gateway: 'manual',
    refunds: [],
    user_id: 95205899,
    currency: 'USD',
    customer: {
        id: 2721145061399,
        note: 'hello',
        tags: '',
        email: 'apu@gorgias.com',
        phone: null,
        state: 'disabled',
        currency: 'USD',
        last_name: 'Nahasapeemapetilon',
        created_at: '2019-12-13T13:52:15-08:00',
        first_name: 'Apu',
        tax_exempt: false,
        updated_at: '2019-12-13T13:57:02-08:00',
        total_spent: '6.00',
        orders_count: 1,
        last_order_id: 1894175539223,
        verified_email: true,
        default_address: {
            id: 2888869838871,
            zip: '',
            city: '',
            name: 'Apu Nahasapeemapetilon',
            phone: '',
            company: '',
            country: 'France',
            default: true,
            address1: '',
            address2: '',
            province: '',
            last_name: 'Nahasapeemapetilon',
            first_name: 'Apu',
            customer_id: 2721145061399,
            country_code: 'FR',
            country_name: 'France',
            province_code: null
        },
        last_order_name: '#1684',
        accepts_marketing: false,
        admin_graphql_api_id: 'gid://shopify/Customer/2721145061399',
        multipass_identifier: null,
        marketing_opt_in_level: null,
        accepts_marketing_updated_at: '2019-12-13T13:52:15-08:00'
    },
    closed_at: null,
    confirmed: true,
    device_id: null,
    reference: null,
    tax_lines: [
        {
            rate: 0.2,
            price: '1.00',
            title: 'TVA',
            price_set: shopifyPriceSetFixture({amount: '1.0'}),
        }
    ],
    total_tax: '1.00',
    browser_ip: null,
    cart_token: null,
    created_at: '2019-12-13T13:54:05-08:00',
    line_items: [
        {
            id: 4193100136471,
            sku: '0987654321-1',
            name: 'Acidulous candy - Red / A',
            grams: 10,
            price: '1.00',
            title: 'Acidulous candy',
            vendor: 'storegorgias3',
            taxable: true,
            quantity: 1,
            gift_card: false,
            price_set: shopifyPriceSetFixture({amount: '1.0'}),
            tax_lines: [
                {
                    rate: 0.2,
                    price: '0.20',
                    title: 'TVA',
                    price_set: shopifyPriceSetFixture({amount: '0.2'}),
                }
            ],
            product_id: 8345093387,
            properties: [],
            variant_id: 31128766316567,
            variant_title: 'Red / A',
            product_exists: true,
            total_discount: '0.00',
            requires_shipping: true,
            fulfillment_status: null,
            total_discount_set: shopifyPriceSetFixture({amount: '0.0'}),
            fulfillment_service: 'manual',
            admin_graphql_api_id: 'gid://shopify/LineItem/4193100136471',
            discount_allocations: [],
            fulfillable_quantity: 1,
            variant_inventory_management: 'shopify'
        },
        {
            id: 4193100169239,
            sku: '0987654321-2',
            name: 'Acidulous candy - Red / B',
            grams: 10,
            price: '1.00',
            title: 'Acidulous candy',
            vendor: 'storegorgias3',
            taxable: true,
            quantity: 4,
            gift_card: false,
            price_set: shopifyPriceSetFixture({amount: '1.0'}),
            tax_lines: [
                {
                    rate: 0.2,
                    price: '0.60',
                    title: 'TVA',
                    price_set: shopifyPriceSetFixture({amount: '0.6'}),
                },
                {
                    rate: 0.2,
                    price: '0.20',
                    title: 'TVA',
                    price_set: shopifyPriceSetFixture({amount: '0.2'}),
                }
            ],
            product_id: 8345093387,
            properties: [],
            variant_id: 31128766349335,
            variant_title: 'Red / B',
            product_exists: true,
            total_discount: '0.00',
            requires_shipping: true,
            fulfillment_status: null,
            total_discount_set: shopifyPriceSetFixture({amount: '0.0'}),
            fulfillment_service: 'manual',
            admin_graphql_api_id: 'gid://shopify/LineItem/4193100169239',
            discount_allocations: [],
            fulfillable_quantity: 4,
            variant_inventory_management: 'shopify'
        }
    ],
    source_url: null,
    updated_at: '2019-12-13T13:56:10-08:00',
    checkout_id: null,
    location_id: null,
    source_name: 'shopify_draft_order',
    total_price: '6.00',
    cancelled_at: null,
    fulfillments: [],
    landing_site: null,
    order_number: 1684,
    processed_at: '2019-12-13T13:54:05-08:00',
    total_weight: 50,
    cancel_reason: null,
    contact_email: 'apu@gorgias.com',
    total_tax_set: shopifyPriceSetFixture(),
    checkout_token: null,
    discount_codes: [],
    referring_site: null,
    shipping_lines: shippingLines,
    subtotal_price: '5.00',
    taxes_included: false,
    billing_address: {
        zip: null,
        city: null,
        name: 'Apu Nahasapeemapetilon',
        phone: null,
        company: null,
        country: 'France',
        address1: null,
        address2: null,
        latitude: null,
        province: null,
        last_name: 'Nahasapeemapetilon',
        longitude: null,
        first_name: 'Apu',
        country_code: 'FR',
        province_code: null
    },
    customer_locale: null,
    note_attributes: [],
    total_discounts: '0.00',
    total_price_set: shopifyPriceSetFixture({amount: '6.00'}),
    total_price_usd: '6.00',
    financial_status: 'partially_paid',
    landing_site_ref: null,
    order_status_url: 'https://storegorgias3.myshopify.com/17817573/orders/46a2ba4414e9539325b3a03975da8657/authenticate?key=b422672687af40802905f0ba54c1b2a9',
    shipping_address: {
        zip: null,
        city: null,
        name: 'Apu Nahasapeemapetilon',
        phone: null,
        company: null,
        country: 'France',
        address1: null,
        address2: null,
        latitude: null,
        province: null,
        last_name: 'Nahasapeemapetilon',
        longitude: null,
        first_name: 'Apu',
        country_code: 'FR',
        province_code: null
    },
    processing_method: 'manual',
    source_identifier: null,
    fulfillment_status: null,
    subtotal_price_set: shopifyPriceSetFixture({amount: '5.00'}),
    total_tip_received: '0.0',
    total_discounts_set: shopifyPriceSetFixture({amount: '0.00'}),
    admin_graphql_api_id: 'gid://shopify/Order/1894175539223',
    presentment_currency: 'USD',
    discount_applications: [],
    payment_gateway_names: [
        'manual'
    ],
    total_line_items_price: '5.00',
    buyer_accepts_marketing: false,
    total_shipping_price_set: shopifyPriceSetFixture({amount: '0.00'}),
    total_line_items_price_set: shopifyPriceSetFixture({amount: '5.00'}),
})

export const shopifyDraftOrderPayloadFixture = (): Shopify.DraftOrder => ({
    shipping_address: {
        zip: null,
        city: null,
        name: 'Apu Nahasapeemapetilon',
        latitude: null,
        phone: null,
        longitude: null,
        province: null,
        last_name: 'Nahasapeemapetilon',
        country_code: 'FR',
        country: 'France',
        first_name: 'Apu',
        province_code: null,
        company: null,
        address1: null,
        address2: null
    },
    applied_discount: {
        title: '',
        value: '100.00',
        value_type: 'percentage',
        amount: '5.00'
    },
    shipping_line: null,
    billing_address: {
        zip: null,
        city: null,
        name: 'Apu Nahasapeemapetilon',
        latitude: null,
        phone: null,
        longitude: null,
        province: null,
        last_name: 'Nahasapeemapetilon',
        country_code: 'FR',
        country: 'France',
        first_name: 'Apu',
        province_code: null,
        company: null,
        address1: null,
        address2: null
    },
    note: 'ahahah??',
    tax_exempt: false,
    line_items: [
        shopifyLineItemFixture(),
        shopifyLineItemFixture({
            quantity: 4,
            variantId: 31128766349335,
            sku: '0987654321-2',
            variantTitle: 'Red / B',
        }),
    ],
    tags: null,
    customer: {
        id: 2721145061399
    },
    currency: 'USD',
})

export const shopifyLineItemFixture = (
    {
        quantity = 1,
        productId = 8345093387,
        variantId = 31128766316567,
        title = 'Acidulous candy',
        sku = '0987654321-1',
        variantTitle = 'Red / A',
        price = '1.00',
        appliedDiscount = null,
    } = {}
): Shopify.LineItem => ({
    taxable: true,
    price,
    quantity,
    product_id: productId,
    product_exists: true,
    properties: [],
    variant_id: variantId,
    title,
    sku,
    variant_title: variantTitle,
    requires_shipping: true,
    applied_discount: appliedDiscount,
})

export const shopifyDraftOrderFixture = (): Shopify.DraftOrder => ({
    taxes_included: false,
    shipping_address: {
        zip: null,
        city: null,
        name: 'Apu Nahasapeemapetilon',
        latitude: null,
        phone: null,
        longitude: null,
        province: null,
        last_name: 'Nahasapeemapetilon',
        country_code: 'FR',
        country: 'France',
        first_name: 'Apu',
        province_code: null,
        company: null,
        address1: null,
        address2: null
    },
    applied_discount: shopifyAppliedDiscountFixture(),
    note_attributes: [],
    shipping_line: null,
    admin_graphql_api_id: 'gid://shopify/DraftOrder/524819955735',
    completed_at: null,
    invoice_sent_at: null,
    created_at: '2020-02-19T14:22:07-08:00',
    tax_lines: [
        shopifyTaxLineFixture(),
        shopifyTaxLineFixture(),
    ],
    name: '#D809',
    order_id: null,
    total_price: '0.00',
    subtotal_price: '0.00',
    total_tax: '0.00',
    billing_address: {
        zip: null,
        city: null,
        name: 'Apu Nahasapeemapetilon',
        latitude: null,
        phone: null,
        longitude: null,
        province: null,
        last_name: 'Nahasapeemapetilon',
        country_code: 'FR',
        country: 'France',
        first_name: 'Apu',
        province_code: null,
        company: null,
        address1: null,
        address2: null
    },
    currency: 'USD',
    note: 'ahahah??',
    status: 'open',
    tax_exempt: false,
    line_items: [
        {
            applied_discount: null,
            taxable: true,
            admin_graphql_api_id: 'gid://shopify/DraftOrderLineItem/54628775657495',
            vendor: 'storegorgias3',
            price: '1.00',
            quantity: 1,
            tax_lines: [
                {
                    rate: 0.2,
                    title: 'TVA',
                    price: '0.00'
                }
            ],
            product_id: 8345093387,
            name: 'Acidulous candy - Red / A',
            custom: false,
            properties: [],
            fulfillment_service: 'manual',
            variant_id: 31128766316567,
            title: 'Acidulous candy',
            grams: 10,
            sku: '0987654321-1',
            variant_title: 'Red / A',
            gift_card: false,
            requires_shipping: true
        },
        {
            applied_discount: null,
            taxable: true,
            admin_graphql_api_id: 'gid://shopify/DraftOrderLineItem/54628775690263',
            vendor: 'storegorgias3',
            price: '1.00',
            quantity: 4,
            tax_lines: [
                {
                    rate: 0.2,
                    title: 'TVA',
                    price: '0.00'
                }
            ],
            product_id: 8345093387,
            name: 'Acidulous candy - Red / B',
            custom: false,
            properties: [],
            fulfillment_service: 'manual',
            variant_id: 31128766349335,
            title: 'Acidulous candy',
            grams: 10,
            sku: '0987654321-2',
            variant_title: 'Red / B',
            gift_card: false,
            requires_shipping: true
        }
    ],
    updated_at: '2020-02-19T14:22:07-08:00',
    tags: '',
    id: 524819955735,
    email: 'apu@gorgias.com',
    invoice_url: 'https://storegorgias3.myshopify.com/17817573/invoices/761484563dc23c0b6c1cf826926899de',
    customer: {
        accepts_marketing_updated_at: '2019-12-13T13:52:15-08:00',
        last_order_name: '#1684',
        verified_email: true,
        admin_graphql_api_id: 'gid://shopify/Customer/2721145061399',
        created_at: '2019-12-13T13:52:15-08:00',
        phone: null,
        marketing_opt_in_level: null,
        currency: 'USD',
        state: 'disabled',
        accepts_marketing: false,
        note: 'hello',
        total_spent: '6.00',
        tax_exempt: false,
        last_name: 'Nahasapeemapetilon',
        orders_count: 1,
        last_order_id: 1894175539223,
        default_address: {
            'default': true,
            zip: '',
            city: '',
            name: 'Apu Nahasapeemapetilon',
            phone: '',
            province: '',
            country_name: 'France',
            last_name: 'Nahasapeemapetilon',
            country_code: 'FR',
            country: 'France',
            first_name: 'Apu',
            id: 2888869838871,
            customer_id: 2721145061399,
            province_code: null,
            company: '',
            address1: '',
            address2: ''
        },
        updated_at: '2019-12-13T13:57:02-08:00',
        tags: '',
        first_name: 'Apu',
        id: 2721145061399,
        email: 'apu@gorgias.com',
        tax_exemptions: [],
        multipass_identifier: null
    }
})

export const shopifyAppliedDiscountFixture = (
    {
        value = '100.0',
        valueType = 'percentage',
        amount = '5.00',
    } = {}
): Shopify.AppliedDiscount => ({
    description: null,
    value,
    title: '',
    amount,
    value_type: valueType,
})

export const shopifyShippingLineFixture = (
    {
        price = '12.00',
        priceSet = shopifyPriceSetFixture({amount: price}),
    } = {}
): Shopify.ShippingLine => ({
    code: 'custom',
    price,
    title: 'Test',
    price_set: priceSet,
})

export const shopifyOrderAdjustmentFixture = (
    {
        kind = 'shipping_refund',
        amount = '-5.00',
    } = {}
): Shopify.OrderAdjustment => ({
    kind,
    amount,
})

export const shopifyCustomLineItemFixture = (): Shopify.LineItem => ({
    title: 'Custom item',
    price: '1.99',
    quantity: 1,
    taxable: true,
    requires_shipping: true,
    product_exists: false,
})

export const shopifyTaxLineFixture = (
    {
        rate = 0.2,
        title = 'TVA',
        price = '0.00',
    } = {}
): Shopify.TaxLine => ({
    rate,
    title,
    price,
})

export const shopifyInvoicePayloadFixture = (): Shopify.DraftOrderInvoice => ({
    to: 'foo@bar.xyz',
    custom_message: 'foo bar',
})

export const shopifyDiscountAllocationFixture = (
    {
        amount = '0.50',
    } = {}
): Shopify.DiscountAllocation => ({
    amount,
    discount_application_index: 0,
})

export const shopifyDiscountApplicationFixture = (
    {
        value = '50.00',
        type = 'percentage',
    } = {}
): Shopify.DiscountApplication => ({
    type: 'manual',
    title: '',
    value,
    value_type: type,
    description: '',
    target_type: 'line_item',
    target_selection: 'explicit',
    allocation_method: 'one',
})

export const shopifyRefundFixture = (
    {
        refundLineItems = [],
        orderAdjustments = [],
    } = {}
): Shopify.Refund => ({
    refund_line_items: refundLineItems,
    order_adjustments: orderAdjustments,
})

export const shopifyRefundLineItemFixture = (): Shopify.RefundLineItem => ({
    id: 139749457943,
    quantity: 1,
    subtotal: 1.0,
    total_tax: 0.2,
    location_id: 12519883,
    line_item_id: 4193100136471,
    restock_type: 'cancel',
})

export const shopifyCancelOrderPayloadFixture = (): Shopify.CancelOrderPayload => ({
    reason: 'customer',
    email: true,
    refund: {
        currency: 'USD',
        restock: true,
        notify: false,
        refund_line_items: [
            {
                line_item_id: 4193100136471,
                restock_type: 'cancel',
                quantity: 1
            }
        ],
        shipping: {
            amount: '0.00'
        }
    },
    amount: '1.00'
})

export const shopifySuggestedRefundFixture = (): Shopify.Refund => ({
    shipping: {
        amount: '0.00',
        tax: '0.00',
        maximum_refundable: '0.00'
    },
    refund_line_items: [
        {
            subtotal: '1.00',
            location_id: 123,
            price: '1.00',
            discounted_price: '1.00',
            quantity: 1,
            discounted_total_price: '1.00',
            total_tax: '0.20',
            total_cart_discount_amount: '0.00',
            restock_type: 'no_restock',
            line_item_id: 4193100136471,
        }
    ],
    transactions: [
        {
            order_id: 1894175539223,
            kind: 'suggested_refund',
            gateway: 'manual',
            parent_id: 2521452118039,
            amount: '1.20',
            currency: 'USD',
            maximum_refundable: '1.20'
        }
    ],
    currency: 'USD',
})
