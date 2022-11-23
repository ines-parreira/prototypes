import {
    BigCommerceIntegration,
    BigCommerceIntegrationMeta,
    IntegrationType,
} from 'models/integration/types'
import {BigCommerceResponse} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/types'

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

export const bigCommerceCartResponseFixture = (): BigCommerceResponse => ({
    id: 'eed98ad3-8f2a-4558-864a-3a9e04d2cb61',
})
