import {
    Image,
    Variant,
    Product,
    PriceSet,
    Customer,
    Order,
    Address,
    LineItem,
    DraftOrder,
    EditOrderPayload,
    AppliedDiscount,
    DraftOrderInvoice,
    TaxLine,
    DiscountAllocation,
    DiscountApplication,
    Refund,
    RefundLineItem,
    RefundOrderPayload,
    CancelOrderPayload,
    CustomerState,
    OrderLineItem,
    FinancialStatus,
    DraftStatus,
    DiscountApplicationType,
    DiscountTargetType,
    DiscountTargetSelection,
    DiscountAllocationMethod,
    DiscountType,
    RestockType,
    CancelReason,
    TransactionKind,
    ShippingLine,
    InventoryManagement,
} from '../constants/integrations/types/shopify'
import {
    IntegrationDataItem,
    IntegrationType,
    IntegrationDataItemType,
} from '../models/integration/types'

export const shopifyImageFixture = (): Image => ({
    id: 1,
    alt: 'Alt',
    src: 'src',
})

export const shopifyVariantFixture = ({
    id = 1,
    sku = '11111',
    title = 'Variant 1',
    price = '9.99',
    inventoryQuantity = 0,
    inventoryManagement = null,
}: {
    id?: number
    sku?: string
    title?: string
    price?: string
    inventoryQuantity?: number
    inventoryManagement?: Maybe<InventoryManagement>
} = {}): Variant => ({
    id,
    admin_graphql_api_id: `gid://shopify/ProductVariant/${id}`,
    sku,
    price,
    title,
    image_id: 1,
    option1: null,
    option2: null,
    option3: null,
    taxable: true,
    requires_shipping: true,
    inventory_quantity: inventoryQuantity,
    inventory_management: inventoryManagement,
})

export const shopifyProductFixture = ({
    id = 1,
    title = 'Product 1',
    variants = [shopifyVariantFixture()],
} = {}): Product => ({
    id,
    title,
    created_at: '2020-01-01 00:00:00.000000',
    image: shopifyImageFixture(),
    images: [shopifyImageFixture()],
    variants,
})

export const integrationDataItemProductFixture = ({
    data = shopifyProductFixture(),
} = {}): IntegrationDataItem<Product> => ({
    id: 1,
    integration_id: 1,
    integration_type: IntegrationType.ShopifyIntegrationType,
    external_id: '123',
    item_type: IntegrationDataItemType.IntegrationDataItemTypeProduct,
    search: 'foo',
    data,
    created_datetime: '2020-02-06 15:15:15.123456',
    updated_datetime: '2020-02-06 15:15:15.123456',
    deleted_datetime: null,
})

export const shopifyPriceSetFixture = ({
    amount = '1.00',
    currencyCode = 'USD',
    presentmentAmount = null,
    presentmentCurrencyCode = null,
}:
    | {
          amount?: string
          currencyCode?: string
          presentmentAmount?: string | null
          presentmentCurrencyCode?: string | null
      }
    | undefined = {}): PriceSet => ({
    shop_money: {
        amount,
        currency_code: currencyCode,
    },
    presentment_money: {
        amount: presentmentAmount || amount,
        currency_code: presentmentCurrencyCode || currencyCode,
    },
})

export const shopifyCustomerFixture = () =>
    ({
        id: 2721145061399,
        email: 'apu@gorgias.com',
        default_address: shopifyAddressFixture(),
        currency: 'USD',
    } as Customer)

export const shopifyOrderFixture = ({
    shippingLines = [],
}: {shippingLines?: Partial<ShippingLine>[]} = {}): Order =>
    ({
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
            state: CustomerState.Disabled,
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
            default_address: shopifyAddressFixture(),
            last_order_name: '#1684',
            accepts_marketing: false,
            admin_graphql_api_id: 'gid://shopify/Customer/2721145061399',
            multipass_identifier: null,
            marketing_opt_in_level: null,
            accepts_marketing_updated_at: '2019-12-13T13:52:15-08:00',
        } as Customer,
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
            },
        ],
        total_tax: '1.00',
        browser_ip: null,
        cart_token: null,
        created_at: '2019-12-13T13:54:05-08:00',
        line_items: ([
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
                    },
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
                variant_inventory_management: 'shopify',
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
                    },
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
                variant_inventory_management: 'shopify',
            },
        ] as unknown) as OrderLineItem[],
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
            province_code: null,
        },
        customer_locale: null,
        note_attributes: [],
        total_discounts: '0.00',
        total_price_set: shopifyPriceSetFixture({amount: '6.00'}),
        total_price_usd: '6.00',
        financial_status: FinancialStatus.PartiallyPaid,
        landing_site_ref: null,
        order_status_url:
            'https://storegorgias3.myshopify.com/17817573/orders/46a2ba4414e9539325b3a03975da8657/authenticate?key=b422672687af40802905f0ba54c1b2a9',
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
            province_code: null,
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
        payment_gateway_names: ['manual'],
        total_line_items_price: '5.00',
        buyer_accepts_marketing: false,
        total_shipping_price_set: shopifyPriceSetFixture({amount: '0.00'}),
        total_line_items_price_set: shopifyPriceSetFixture({amount: '5.00'}),
    } as Order)

export const shopifyMultiCurrencyOrderFixture = (): Order =>
    (({
        id: 2177984102539,
        name: '#1012',
        note: null,
        tags: '',
        test: true,
        email: 'samy+lumine@gorgias.com',
        phone: null,
        token: '02bb19dc21bf27e8f9763c5261019872',
        app_id: 580111,
        number: 12,
        gateway: 'bogus',
        refunds: [],
        user_id: null,
        currency: 'JPY',
        customer: {
            id: 3344481681547,
            note: null,
            tags: '',
            email: 'samy+lumine@gorgias.com',
            phone: null,
            state: 'disabled',
            currency: 'JPY',
            last_name: 'Lumine',
            created_at: '2020-04-14T20:14:42-04:00',
            first_name: 'Samy',
            tax_exempt: false,
            updated_at: '2020-04-14T20:15:11-04:00',
            total_spent: '0.00',
            orders_count: 0,
            last_order_id: null,
            tax_exemptions: [],
            verified_email: true,
            default_address: {
                id: 3337870934155,
                zip: '94103',
                city: 'SF',
                name: 'Samy Lumine',
                phone: null,
                company: null,
                country: 'United States',
                default: true,
                address1: '1188 Mission St',
                address2: '',
                province: 'California',
                last_name: 'Lumine',
                first_name: 'Samy',
                customer_id: 3344481681547,
                country_code: 'US',
                country_name: 'United States',
                province_code: 'CA',
            },
            last_order_name: null,
            accepts_marketing: false,
            admin_graphql_api_id: 'gid://shopify/Customer/3344481681547',
            multipass_identifier: null,
            marketing_opt_in_level: null,
            accepts_marketing_updated_at: '2020-04-14T20:14:42-04:00',
        },
        closed_at: null,
        confirmed: true,
        device_id: null,
        reference: null,
        tax_lines: [
            {
                rate: 0.0725,
                price: '6987',
                title: 'CA State Tax',
                price_set: {
                    shop_money: {
                        amount: '6987',
                        currency_code: 'JPY',
                    },
                    presentment_money: {
                        amount: '65.11',
                        currency_code: 'USD',
                    },
                },
            },
            {
                rate: 0.0125,
                price: '1205',
                title: 'San Francisco County Tax',
                price_set: {
                    shop_money: {
                        amount: '1205',
                        currency_code: 'JPY',
                    },
                    presentment_money: {
                        amount: '11.23',
                        currency_code: 'USD',
                    },
                },
            },
        ],
        total_tax: '8192',
        browser_ip: '24.5.175.157',
        cart_token: '',
        created_at: '2020-04-14T20:15:11-04:00',
        line_items: [
            {
                id: 4692703838347,
                sku: '',
                name: 'Smartphone',
                grams: 2240,
                price: '96377',
                title: 'Smartphone',
                vendor: 'samy-test2',
                taxable: true,
                quantity: 1,
                gift_card: false,
                price_set: {
                    shop_money: {
                        amount: '96377',
                        currency_code: 'JPY',
                    },
                    presentment_money: {
                        amount: '898.10',
                        currency_code: 'USD',
                    },
                },
                tax_lines: [
                    {
                        rate: 0.0725,
                        price: '6987',
                        title: 'CA State Tax',
                        price_set: {
                            shop_money: {
                                amount: '6987',
                                currency_code: 'JPY',
                            },
                            presentment_money: {
                                amount: '65.11',
                                currency_code: 'USD',
                            },
                        },
                    },
                    {
                        rate: 0.0125,
                        price: '1205',
                        title: 'San Francisco County Tax',
                        price_set: {
                            shop_money: {
                                amount: '1205',
                                currency_code: 'JPY',
                            },
                            presentment_money: {
                                amount: '11.23',
                                currency_code: 'USD',
                            },
                        },
                    },
                ],
                product_id: 4624387440779,
                properties: [],
                variant_id: 32685678362763,
                variant_title: '',
                product_exists: true,
                total_discount: '0',
                origin_location: {
                    id: 1861907775627,
                    zip: '94103',
                    city: 'San Francisco',
                    name: 'samy-test2',
                    address1: '34 Harriet St',
                    address2: '',
                    country_code: 'US',
                    province_code: 'CA',
                },
                requires_shipping: true,
                fulfillment_status: null,
                total_discount_set: {
                    shop_money: {
                        amount: '0',
                        currency_code: 'JPY',
                    },
                    presentment_money: {
                        amount: '0.00',
                        currency_code: 'USD',
                    },
                },
                fulfillment_service: 'manual',
                admin_graphql_api_id: 'gid://shopify/LineItem/4692703838347',
                discount_allocations: [],
                fulfillable_quantity: 1,
                variant_inventory_management: 'shopify',
            },
        ],
        source_url: null,
        updated_at: '2020-04-14T20:16:23-04:00',
        checkout_id: 12632339939467,
        location_id: null,
        source_name: 'web',
        total_price: '105646',
        cancelled_at: null,
        fulfillments: [],
        landing_site: '/wallets/checkouts.json',
        order_number: 1012,
        processed_at: '2020-04-14T20:15:10-04:00',
        total_weight: 2240,
        cancel_reason: null,
        contact_email: 'samy+lumine@gorgias.com',
        total_tax_set: {
            shop_money: {
                amount: '8192',
                currency_code: 'JPY',
            },
            presentment_money: {
                amount: '76.34',
                currency_code: 'USD',
            },
        },
        checkout_token: 'bc493ee2aeb737e5dea6a8edf950369f',
        client_details: {
            browser_ip: '24.5.175.157',
            user_agent:
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36',
            session_hash: null,
            browser_width: 2560,
            browser_height: 1306,
            accept_language: 'en-US,en;q=0.9,fr;q=0.8',
        },
        discount_codes: [],
        referring_site:
            'https://samy-test2.myshopify.com/collections/frontpage/products/smartphone',
        shipping_lines: [
            {
                id: 1776909615243,
                code: 'Expedited',
                phone: null,
                price: '1077',
                title: 'Expedited',
                source: 'shopify',
                price_set: {
                    shop_money: {
                        amount: '1077',
                        currency_code: 'JPY',
                    },
                    presentment_money: {
                        amount: '10.04',
                        currency_code: 'USD',
                    },
                },
                tax_lines: [],
                discounted_price: '1077',
                delivery_category: null,
                carrier_identifier: null,
                discount_allocations: [],
                discounted_price_set: {
                    shop_money: {
                        amount: '1077',
                        currency_code: 'JPY',
                    },
                    presentment_money: {
                        amount: '10.04',
                        currency_code: 'USD',
                    },
                },
                requested_fulfillment_service_id: null,
            },
        ],
        subtotal_price: '96377',
        taxes_included: false,
        billing_address: {
            zip: '94103',
            city: 'SF',
            name: 'Samy Lumine',
            phone: null,
            company: null,
            country: 'United States',
            address1: '1188 Mission St',
            address2: '',
            latitude: 37.7783923,
            province: 'California',
            last_name: 'Lumine',
            longitude: -122.41288,
            first_name: 'Samy',
            country_code: 'US',
            province_code: 'CA',
        },
        customer_locale: 'en',
        note_attributes: [],
        payment_details: {
            avs_result_code: null,
            credit_card_bin: '1',
            cvv_result_code: null,
            credit_card_number: '•••• •••• •••• 1',
            credit_card_company: 'Bogus',
        },
        total_discounts: '0',
        total_price_set: {
            shop_money: {
                amount: '105646',
                currency_code: 'JPY',
            },
            presentment_money: {
                amount: '984.48',
                currency_code: 'USD',
            },
        },
        total_price_usd: '981.62',
        financial_status: FinancialStatus.Paid,
        landing_site_ref: null,
        order_status_url:
            'https://samy-test2.myshopify.com/35156820107/orders/02bb19dc21bf27e8f9763c5261019872/authenticate?key=e50cf6d29745c7b7c3a3d992e097d4d4',
        shipping_address: {
            zip: '94103',
            city: 'SF',
            name: 'Samy Lumine',
            phone: null,
            company: null,
            country: 'United States',
            address1: '1188 Mission St',
            address2: '',
            latitude: 37.7783923,
            province: 'California',
            last_name: 'Lumine',
            longitude: -122.41288,
            first_name: 'Samy',
            country_code: 'US',
            province_code: 'CA',
        },
        processing_method: 'direct',
        source_identifier: null,
        fulfillment_status: null,
        subtotal_price_set: {
            shop_money: {
                amount: '96377',
                currency_code: 'JPY',
            },
            presentment_money: {
                amount: '898.10',
                currency_code: 'USD',
            },
        },
        total_tip_received: '0.0',
        total_discounts_set: {
            shop_money: {
                amount: '0',
                currency_code: 'JPY',
            },
            presentment_money: {
                amount: '0.00',
                currency_code: 'USD',
            },
        },
        admin_graphql_api_id: 'gid://shopify/Order/2177984102539',
        presentment_currency: 'USD',
        discount_applications: [],
        payment_gateway_names: ['bogus'],
        total_line_items_price: '96377',
        buyer_accepts_marketing: false,
        total_shipping_price_set: {
            shop_money: {
                amount: '1077',
                currency_code: 'JPY',
            },
            presentment_money: {
                amount: '10.04',
                currency_code: 'USD',
            },
        },
        total_line_items_price_set: {
            shop_money: {
                amount: '96377',
                currency_code: 'JPY',
            },
            presentment_money: {
                amount: '898.10',
                currency_code: 'USD',
            },
        },
    } as unknown) as Order)

export const shopifyAddressFixture = () =>
    ({
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
        province_code: null,
    } as Address)

export const shopifyDraftOrderPayloadFixture = () =>
    (({
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
            address2: null,
        },
        applied_discount: {
            title: '',
            value: '100.00',
            value_type: 'percentage',
            amount: '5.00',
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
            address2: null,
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
            id: 2721145061399,
            admin_graphql_api_id: 'gid://shopify/Customer/2721145061399',
        },
        currency: 'USD',
    } as unknown) as DraftOrder)

export const shopifyLineItemFixture = ({
    quantity = 1,
    productId = 8345093387,
    variantId = 31128766316567,
    title = 'Acidulous candy',
    sku = '0987654321-1',
    variantTitle = 'Red / A',
    price = '1.00',
    appliedDiscount = null,
    currencyCode = null,
    presentmentPrice = null,
    presentmentCurrencyCode = null,
}: {
    quantity?: number
    productId?: number
    variantId?: number
    title?: string
    sku?: string
    variantTitle?: string
    price?: string
    appliedDiscount?: Maybe<number>
    currencyCode?: Maybe<string>
    presentmentPrice?: Maybe<string>
    presentmentCurrencyCode?: Maybe<string>
} = {}): LineItem => {
    const lineItem = {
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
    }

    if (currencyCode) {
        const setPrice = shopifyPriceSetFixture({
            amount: price,
            currencyCode,
            presentmentAmount: presentmentPrice || price,
            presentmentCurrencyCode: presentmentCurrencyCode || currencyCode,
        } as any)

        ;(lineItem as Record<string, unknown>).price_set = setPrice
        ;(lineItem as Record<string, unknown>).total_discount_set = setPrice
    }

    return (lineItem as unknown) as LineItem
}

export const shopifyDraftOrderFixture = () =>
    (({
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
            address2: null,
        },
        applied_discount: shopifyAppliedDiscountFixture(),
        note_attributes: [],
        shipping_line: null,
        admin_graphql_api_id: 'gid://shopify/DraftOrder/524819955735',
        completed_at: null,
        invoice_sent_at: null,
        created_at: '2020-02-19T14:22:07-08:00',
        tax_lines: [shopifyTaxLineFixture(), shopifyTaxLineFixture()],
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
            address2: null,
        },
        currency: 'USD',
        note: 'ahahah??',
        status: DraftStatus.Open,
        tax_exempt: false,
        line_items: [
            {
                applied_discount: null,
                taxable: true,
                admin_graphql_api_id:
                    'gid://shopify/DraftOrderLineItem/54628775657495',
                vendor: 'storegorgias3',
                price: '1.00',
                quantity: 1,
                tax_lines: [
                    {
                        rate: 0.2,
                        title: 'TVA',
                        price: '0.00',
                    },
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
                requires_shipping: true,
            },
            {
                applied_discount: null,
                taxable: true,
                admin_graphql_api_id:
                    'gid://shopify/DraftOrderLineItem/54628775690263',
                vendor: 'storegorgias3',
                price: '1.00',
                quantity: 4,
                tax_lines: [
                    {
                        rate: 0.2,
                        title: 'TVA',
                        price: '0.00',
                    },
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
                requires_shipping: true,
            },
        ],
        updated_at: '2020-02-19T14:22:07-08:00',
        tags: '',
        id: 524819955735,
        email: 'apu@gorgias.com',
        invoice_url:
            'https://storegorgias3.myshopify.com/17817573/invoices/761484563dc23c0b6c1cf826926899de',
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
                default: true,
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
                address2: '',
            },
            updated_at: '2019-12-13T13:57:02-08:00',
            tags: '',
            first_name: 'Apu',
            id: 2721145061399,
            email: 'apu@gorgias.com',
            tax_exemptions: [],
            multipass_identifier: null,
        },
    } as unknown) as DraftOrder)

export const shopifyAppliedDiscountFixture = ({
    value = '100.0',
    valueType = 'percentage',
    amount = '5.00',
} = {}) =>
    (({
        description: null,
        value,
        title: '',
        amount,
        value_type: valueType,
    } as unknown) as AppliedDiscount)

export const shopifyShippingLineFixture = ({price = '12.00'} = {}) => ({
    custom: false,
    handle: 'shopify-Standard%20Shipping-10.00',
    price,
    title: 'Standard Shipping',
})

export const shopifyEditOrderPayloadFixture = (): EditOrderPayload => ({
    calculatedOrderId: '123456789',
    total_line_items_price: '80',
    current_total_tax: '20',
    current_total_price: '100',
    paid_by_customer: '50',
    amount_to_collect: '100',
    has_changes: true,
})

export const shopifyCustomLineItemFixture = () =>
    ({
        title: 'Custom item',
        price: '1.99',
        quantity: 1,
        taxable: true,
        requires_shipping: true,
        product_exists: false,
    } as LineItem)

export const shopifyTaxLineFixture = ({
    rate = 0.2,
    title = 'TVA',
    price = '0.00',
} = {}): TaxLine => ({
    rate,
    title,
    price,
})

export const shopifyInvoicePayloadFixture = (): DraftOrderInvoice => ({
    to: 'foo@bar.xyz',
    custom_message: 'foo bar',
})

export const shopifyDiscountAllocationFixture = ({
    amount = '0.50',
}: any = {}): DiscountAllocation => ({
    amount,
    discount_application_index: 0,
})

export const shopifyDiscountApplicationFixture = ({
    value = '50.00',
    type = DiscountType.Percentage,
    allocationMethod = DiscountAllocationMethod.Across,
} = {}): DiscountApplication => ({
    type: DiscountApplicationType.Manual,
    title: '',
    value,
    value_type: type,
    description: '',
    target_type: DiscountTargetType.LineItem,
    target_selection: DiscountTargetSelection.Explicit,
    allocation_method: allocationMethod,
})

export const shopifyRefundFixture = ({
    refundLineItems = [],
    orderAdjustments = [],
} = {}) =>
    (({
        refund_line_items: refundLineItems,
        order_adjustments: orderAdjustments,
    } as unknown) as Refund)

export const shopifyRefundLineItemFixture = (): RefundLineItem => ({
    id: 139749457943,
    quantity: 1,
    subtotal: 1.0,
    total_tax: 0.2,
    location_id: 12519883,
    line_item_id: 4193100136471,
    restock_type: RestockType.Cancel,
})

export const shopifyCancelOrderPayloadFixture = (): CancelOrderPayload => ({
    reason: CancelReason.Customer,
    email: true,
    refund: shopifyRefundOrderPayloadFixture({notify: false}),
})

export const shopifyRefundOrderPayloadFixture = ({notify = true} = {}) =>
    (({
        currency: 'USD',
        restock: true,
        notify,
        refund_line_items: [
            {
                line_item_id: 4193100136471,
                restock_type: RestockType.Cancel,
                fulfillment_status: null,
                quantity: 1,
            },
        ],
        shipping: {
            amount: '0.00',
        },
        transactions: [{amount: '1.00'}],
    } as unknown) as RefundOrderPayload)

export const shopifySuggestedRefundFixture = ({
    locationId = 123,
}: {locationId?: Maybe<number>} = {}) =>
    (({
        shipping: {
            amount: '0.00',
            tax: '0.00',
            maximum_refundable: '2.00',
        },
        refund_line_items: [
            {
                subtotal: '1.00',
                location_id: locationId,
                price: '1.00',
                discounted_price: '1.00',
                quantity: 1,
                discounted_total_price: '1.00',
                total_tax: '0.20',
                total_cart_discount_amount: '0.00',
                restock_type: RestockType.NoRestock,
                line_item_id: 4193100136471,
            },
        ],
        transactions: [
            {
                order_id: 1894175539223,
                kind: TransactionKind.SuggestedRefund,
                gateway: 'manual',
                parent_id: 2521452118039,
                amount: '1.20',
                currency: 'USD',
                maximum_refundable: '1.20',
            },
        ],
        currency: 'USD',
    } as unknown) as Refund)

export const shopifyCalculatedDraftOrderFixture = () => ({
    appliedDiscount: {
        amountV2: {
            amount: '5.00',
            currencyCode: 'USD',
        },
    },
    taxLines: [shopifyCalculatedTaxLine()],
    subtotalPrice: '0.00',
    totalPrice: '0.00',
    totalShippingPrice: '0.00',
    totalTax: '0.00',
    availableShippingRates: [],
})

export const shopifyCalculatedTaxLine = () => ({
    priceSet: {
        presentmentMoney: {
            amount: '0.00',
            currencyCode: 'USD',
        },
    },
    rate: 0.2,
    ratePercentage: 20.0,
    title: 'TVA',
})

export const shopifyAvailableShippingRate = () => ({
    handle: 'shopify-Standard%20Shipping-10.00',
    title: 'Standard Shipping',
    price: {
        amount: '10.0',
    },
})
