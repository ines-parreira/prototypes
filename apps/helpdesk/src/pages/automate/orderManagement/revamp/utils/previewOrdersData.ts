import type { GorgiasChatPreviewOrdersOptions } from 'models/integration/types/gorgiasChat'

const PREVIEW_ORDER_CREATED_AT = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
).toISOString()

export const TRACK_ORDER_PREVIEW_ORDERS: GorgiasChatPreviewOrdersOptions = {
    orders: {
        '#1001': {
            id: 1001,
            email: '',
            name: '#1001',
            order_number: 1001,
            processed_at: PREVIEW_ORDER_CREATED_AT,
            created_at: PREVIEW_ORDER_CREATED_AT,
            updated_at: PREVIEW_ORDER_CREATED_AT,
            cancelled_at: null,
            closed_at: null,
            financial_status: 'paid',
            fulfillment_status: null,
            shipping_address: {
                name: 'John Doe',
                first_name: 'John',
                last_name: 'Doe',
                address1: '1231 5th Ave',
                address2: null,
                city: 'New York',
                province: 'NY',
                zip: '10014',
                country: 'United States',
                country_code: 'US',
                phone: null,
                company: null,
                latitude: null,
                longitude: null,
                province_code: null,
            },
            billing_address: null,
            line_items: [],
            fulfillments: [
                {
                    id: 1,
                    name: '#1001.1',
                    shipment_status: null,
                    line_items: [],
                    tracking_urls: [],
                    tracking_numbers: [],
                    tracking_company: null,
                    gorgias_order_status: 'unfulfilled',
                    updated_at: PREVIEW_ORDER_CREATED_AT,
                    created_at: PREVIEW_ORDER_CREATED_AT,
                    flows: {
                        track_order: true,
                        cancel_order: false,
                        return_order: false,
                        report_issue_reasons: [],
                    },
                },
            ],
            subtotal_price_set: {
                shop_money: { amount: '0', currency_code: 'USD' },
                presentment_money: { amount: '0', currency_code: 'USD' },
            },
            total_price_set: {
                shop_money: { amount: '0', currency_code: 'USD' },
                presentment_money: { amount: '0', currency_code: 'USD' },
            },
            total_shipping_price_set: {
                shop_money: { amount: '0', currency_code: 'USD' },
                presentment_money: { amount: '0', currency_code: 'USD' },
            },
            refunded_amount: 0,
        },
    },
    tracking: {
        status: 'order_placed',
        tracking_company: null,
        tracking_numbers: [],
        courier_tracking_urls: [],
        expected_delivery: '',
        last_updated_at: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        checkpoints: [],
    },
    flows: {
        track_order: true,
        cancel_order: false,
        return_order: false,
        report_issue: false,
    },
}
