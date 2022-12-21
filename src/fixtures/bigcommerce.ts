import {
    BigCommerceIntegration,
    BigCommerceIntegrationMeta,
    BigCommerceCart,
    IntegrationType,
    BigCommerceCartLineItem,
    BigCommerceCustomerAddress,
    BigCommerceCustomerAddressType,
    BigCommerceProductVariant,
    BigCommerceProduct,
    BigCommerceNestedCart,
    BigCommerceConsignment,
    BigCommerceCheckout,
    BigCommerceBillingAddress,
} from 'models/integration/types'

export const bigCommerceCustomerFixture = () => ({
    id: 1234,
    email: 'dax@gorgias.com',
})

export const bigCommerceIntegrationMetaFixture =
    (): BigCommerceIntegrationMeta => ({
        shop_id: 1002422925,
        currency: 'EUR',
        oauth: {
            scope: 'store_cart store_checkout store_payments_access_token_create store_payments_methods_read store_v2_content_read_only store_v2_customers store_v2_default store_v2_information_read_only store_v2_orders store_v2_products_read_only store_v2_transactions users_basic_information',
            status: 'success',
            error: '',
        },
        webhooks: [
            {
                topic: 'store/customer/created',
                address:
                    'https://incoming.example/api/incoming/bigcommerce/customer/created/',
                webhook_id: 24740675,
            },
            {
                topic: 'store/customer/updated',
                address:
                    'https://incoming.example/api/incoming/bigcommerce/customer/updated/',
                webhook_id: 24740676,
            },
            {
                topic: 'store/customer/deleted',
                address:
                    'https://incoming.example/api/incoming/bigcommerce/customer/deleted/',
                webhook_id: 24740677,
            },
            {
                topic: 'store/customer/address/created',
                address:
                    'https://incoming.example/api/incoming/bigcommerce/customer/address/created/',
                webhook_id: 24740678,
            },
            {
                topic: 'store/customer/address/updated',
                address:
                    'https://incoming.example/api/incoming/bigcommerce/customer/address/updated/',
                webhook_id: 24740679,
            },
            {
                topic: 'store/customer/address/deleted',
                address:
                    'https://incoming.example/api/incoming/bigcommerce/customer/address/deleted/',
                webhook_id: 24740680,
            },
            {
                topic: 'store/order/created',
                address:
                    'https://incoming.example/api/incoming/bigcommerce/order/created/',
                webhook_id: 24740681,
            },
            {
                topic: 'store/order/updated',
                address:
                    'https://incoming.example/api/incoming/bigcommerce/order/updated/',
                webhook_id: 24740682,
            },
            {
                topic: 'store/order/archived',
                address:
                    'https://incoming.example/api/incoming/bigcommerce/order/archived/',
                webhook_id: 24740683,
            },
            {
                topic: 'store/product/created',
                address:
                    'https://incoming.example/api/incoming/bigcommerce/product/created/',
                webhook_id: 24740684,
            },
            {
                topic: 'store/product/updated',
                address:
                    'https://incoming.example/api/incoming/bigcommerce/product/updated/',
                webhook_id: 24740685,
            },
            {
                topic: 'store/product/deleted',
                address:
                    'https://incoming.example/api/incoming/bigcommerce/product/deleted/',
                webhook_id: 24740686,
            },
            {
                topic: 'store/information/updated',
                address:
                    'https://incoming.example/api/incoming/bigcommerce/information/updated/',
                webhook_id: 24740687,
            },
        ],
        shop_plan: 'Partner Sandbox',
        shop_phone: '+4074321231',
        store_hash: 'pk360c6rooa',
        shop_domain: 'max-mad-store.mybigcommerce.com',
        import_state: {
            products: {
                is_over: false,
                oldest_created_at: '2022-05-25T09:04:19+00:00',
            },
            customers: {
                is_over: false,
                oldest_created_at: '2022-04-28T09:38:35Z',
            },
            external_orders: {
                is_over: false,
                oldest_created_at: 'Fri, 06 May 2022 08:05:13 +0000',
            },
        },
        shop_display_name: 'Max Mad Store3',
        sync_customer_notes: true,
        available_currencies: ['EUR', 'USD'],
    })

export const bigCommerceIntegrationFixture = (): BigCommerceIntegration => ({
    deleted_datetime: null,
    mappings: [],
    meta: bigCommerceIntegrationMetaFixture(),
    http: null,
    deactivated_datetime: null,
    name: 'My Shop',
    uri: '/api/integrations/1/',
    decoration: null,
    locked_datetime: null,
    created_datetime: '2022-01-28T22:19:15.604153+00:00',
    type: IntegrationType.BigCommerce,
    id: 1,
    description: null,
    updated_datetime: '2022-01-28T22:19:15.604157+00:00',
    user: {
        id: 1,
    },
})

export const bigCommerceEmptyCartFixture = (): BigCommerceCart => ({
    id: 'c58d3aac-244c-4405-bad5-638b555bc31b',
    customer_id: 1,
    channel_id: 1,
    email: 'alexandru.daineanu+bigcommerce@gorgias.com',
    currency: {
        code: 'EUR',
    },
    tax_included: false,
    base_amount: 0,
    discount_amount: 0,
    cart_amount: 0,
    coupons: [],
    discounts: [],
    line_items: {
        physical_items: [],
        digital_items: [],
        gift_certificates: [],
        custom_items: [],
    },
    created_time: '2022-12-02T11:50:22+00:00',
    updated_time: '2022-12-02T11:50:22+00:00',
    locale: 'en',
})

export const bigCommerceLineItemFixture = (): BigCommerceCartLineItem => ({
    id: '3aee2b2f-9182-4d16-82ae-734dced3d218',
    parent_id: null,
    variant_id: 324,
    product_id: 245,
    sku: '',
    name: 'test 102',
    url: 'https://max-mad-store.mybigcommerce.com/test-102/',
    quantity: 1,
    taxable: true,
    image_url:
        'https://cdn11.bigcommerce.com/r-4b20dad619e29ebf3490f7f35369a8220637ce48/themes/ClassicNext/images/ProductDefault.gif',
    discounts: [],
    coupons: [],
    discount_amount: 0,
    coupon_amount: 0,
    original_price: 78,
    list_price: 78,
    sale_price: 78,
    extended_list_price: 78,
    extended_sale_price: 78,
    is_require_shipping: true,
    is_mutable: true,
})

export const bigCommerceShippingAddressesFixture: BigCommerceCustomerAddress[] =
    [
        {
            postal_code: '507050',
            address_type: BigCommerceCustomerAddressType.Residential,
            city: 'Paris',
            phone: '',
            last_name: 'Test 1',
            country_code: 'FR',
            country: 'France',
            first_name: 'A',
            id: 5,
            customer_id: 160,
            company: '',
            address1: 'Random Street 19',
            address2: '',
            state_or_province: 'Paris',
            email: 'test2@gorgias.com',
        },
        {
            postal_code: '507051',
            address_type: BigCommerceCustomerAddressType.Residential,
            city: 'Paris',
            phone: '',
            last_name: 'Test 2',
            country_code: 'FR',
            country: 'France',
            first_name: 'A',
            id: 13,
            customer_id: 160,
            company: 'test',
            address1: 'Random Street 19',
            address2: '',
            state_or_province: 'Paris',
            email: 'test2@gorgias.com',
        },
    ]

export const bigCommerceCartFixture = (): BigCommerceCart => ({
    id: 'c58d3aac-244c-4405-bad5-638b555bc31b',
    customer_id: 1,
    channel_id: 1,
    email: 'alexandru.daineanu+bigcommerce@gorgias.com',
    currency: {
        code: 'EUR',
    },
    tax_included: false,
    base_amount: 78,
    discount_amount: 0,
    cart_amount: 93.6,
    coupons: [],
    discounts: [
        {
            id: '3aee2b2f-9182-4d16-82ae-734dced3d218',
            discounted_amount: 0,
        },
    ],
    line_items: {
        physical_items: [bigCommerceLineItemFixture()],
        digital_items: [],
        gift_certificates: [],
        custom_items: [],
    },
    created_time: '2022-12-02T11:50:22+00:00',
    updated_time: '2022-12-02T11:52:28+00:00',
    locale: 'en',
})

export const BigCommerceNestedCartFixture = (): BigCommerceNestedCart => ({
    data: bigCommerceCartFixture(),
})

export const bigCommerceVariantFixture = (): BigCommerceProductVariant => ({
    id: 1,
    sku: 'SLCTBS-A9615491',
    price: null,
    image_url: '',
    product_id: 77,
    inventory_level: 0,
    options: [],
})

export const bigCommerceProductFixture = (): BigCommerceProduct => ({
    id: 77,
    sku: 'SLCTBS',
    name: '[Sample] Serviette de plage Fog Linen en chambray - Beige rayé',
    image_url:
        'https://cdn11.bigcommerce.com/s-pk360c6roo/products/77/images/266/foglinenbeigestripetowel1b.1650970371.220.290.jpg?c=1',
    inventory_level: 0,
    inventory_tracking: 'none',
    created_at: '2022-12-02T11:50:22+00:00',
    options: [],
    variants: [bigCommerceVariantFixture()],
})

export const bigCommerceConsignmentFixture: BigCommerceConsignment = {
    id: 'consignment-id',
    available_shipping_options: [
        {
            id: 'available-shipping-option-1',
            description: 'Description One',
            cost: 55,
            type: 'some-type',
            additional_description: '',
            image_url: '',
            transit_time: '',
        },
        {
            id: 'available-shipping-option-2',
            description: 'Description Two',
            cost: 66,
            type: 'some-type',
            additional_description: '',
            image_url: '',
            transit_time: '',
        },
    ],
    address: {
        postal_code: '507050',
        city: 'Paris',
        phone: '',
        last_name: 'Test 1',
        country_code: 'FR',
        country: 'France',
        first_name: 'A',
        id: '5',
        company: '',
        address1: 'Random Street 19',
        address2: '',
        state_or_province: 'Paris',
        state_or_province_code: '',
        email: 'test2@gorgias.com',
        custom_fields: [],
    },
    line_item_ids: [],
    selected_shipping_option: undefined,
}

export const bigCommerceCheckoutFixture: BigCommerceCheckout = {
    id: 'checkout-yo',
    created_time: '2022-01-28T22:19:15.604153+00:00',
    updated_time: '2022-01-30T22:19:15.604153+00:00',
    cart: bigCommerceCartFixture(),
    taxes: [
        {
            amount: 222,
            name: 'Some Tax',
        },
        {amount: 0, name: 'No tax'},
    ],
    coupons: [],
    consignments: [bigCommerceConsignmentFixture],
    billing_address: {
        ...bigCommerceShippingAddressesFixture[0],
        id: 'a-billing-address',
        state_or_province_code: '',
        custom_fields: [],
    } as BigCommerceBillingAddress,
    shipping_cost_total_ex_tax: 333,
    shipping_cost_total_inc_tax: 444,
    handling_cost_total_ex_tax: 555,
    handling_cost_total_inc_tax: 666,
    subtotal_ex_tax: 111,
    subtotal_inc_tax: 222,
    tax_total: 222,
    grand_total: 999,
    order_id: 'any',
    customer_message: '',
}
