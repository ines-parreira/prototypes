import chainBracelet from 'assets/img/self-service/chain-bracelet.png'
import graphicTShirt from 'assets/img/self-service/graphic-t-shirt.png'
import type {
    GorgiasChatPreviewLineItem,
    GorgiasChatPreviewOrdersOptions,
} from 'models/integration/types/gorgiasChat'

import { PREVIEW_ORDER_CREATED_AT } from '../../../utils/previewOrdersData'

function toAbsoluteUrl(path: string): string {
    if (path.startsWith('http')) return path
    return `${window.location.origin}${path}`
}

const PREVIEW_LINE_ITEMS: GorgiasChatPreviewLineItem[] = [
    {
        title: 'Graphic T-Shirt',
        variant_title: null,
        quantity: 1,
        price_set: {
            shop_money: { amount: '10.00', currency_code: 'USD' },
            presentment_money: { amount: '10.00', currency_code: 'USD' },
        },
        product_image_url: toAbsoluteUrl(graphicTShirt),
    },
    {
        title: 'Chain Bracelet',
        variant_title: null,
        quantity: 1,
        price_set: {
            shop_money: { amount: '10.00', currency_code: 'USD' },
            presentment_money: { amount: '10.00', currency_code: 'USD' },
        },
        product_image_url: toAbsoluteUrl(chainBracelet),
    },
]

export const REPORT_ORDER_ISSUE_PREVIEW_ORDERS: GorgiasChatPreviewOrdersOptions =
    {
        orders: {
            '#3089': {
                id: 3089,
                email: '',
                name: '#3089',
                order_number: 3089,
                processed_at: PREVIEW_ORDER_CREATED_AT,
                created_at: PREVIEW_ORDER_CREATED_AT,
                updated_at: PREVIEW_ORDER_CREATED_AT,
                cancelled_at: null,
                closed_at: null,
                financial_status: 'paid',
                fulfillment_status: null,
                shipping_address: null,
                billing_address: null,
                line_items: PREVIEW_LINE_ITEMS,
                fulfillments: [
                    {
                        id: 1,
                        name: '#3089.1',
                        shipment_status: null,
                        line_items: PREVIEW_LINE_ITEMS,
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
                            report_issue_reasons: ['damaged', 'wrong_item'],
                        },
                    },
                ],
                subtotal_price_set: {
                    shop_money: { amount: '20.00', currency_code: 'USD' },
                    presentment_money: {
                        amount: '20.00',
                        currency_code: 'USD',
                    },
                },
                total_price_set: {
                    shop_money: { amount: '20.00', currency_code: 'USD' },
                    presentment_money: {
                        amount: '20.00',
                        currency_code: 'USD',
                    },
                },
                total_shipping_price_set: {
                    shop_money: { amount: '0', currency_code: 'USD' },
                    presentment_money: { amount: '0', currency_code: 'USD' },
                },
                refunded_amount: 0,
            },
        },
        flows: {
            track_order: true,
            cancel_order: false,
            return_order: false,
            report_issue: true,
        },
    }
