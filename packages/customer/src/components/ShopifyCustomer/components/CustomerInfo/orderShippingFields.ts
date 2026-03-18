import { getMoneySymbol } from '@repo/utils'

import type { OrderFieldConfig } from './types'

export const SHIPPING_FIELD_DEFINITIONS: Record<string, OrderFieldConfig> = {
    tracking_url: {
        id: 'tracking_url',
        type: 'readonly',
        label: 'Tracking URL',
        getValue: (ctx) =>
            ctx.order.fulfillments?.[0]?.tracking_url ?? undefined,
    },
    tracking_number: {
        id: 'tracking_number',
        type: 'readonly',
        label: 'Tracking number',
        getValue: (ctx) =>
            ctx.order.fulfillments?.[0]?.tracking_number ?? undefined,
    },
    shipping_cost: {
        id: 'shipping_cost',
        type: 'readonly',
        label: 'Shipping cost',
        getValue: (ctx) => ctx.order.total_shipping_price,
        formatValue: (value, ctx) => {
            if (value == null) return '-'
            const symbol = ctx.order.currency
                ? getMoneySymbol(ctx.order.currency, true)
                : ''
            return `${symbol}${value}`
        },
    },
    code: {
        id: 'code',
        type: 'readonly',
        label: 'Code',
        getValue: (ctx) => ctx.order.shipping_lines?.[0]?.code,
    },
}
