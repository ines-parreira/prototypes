import { getMoneySymbol } from '@repo/utils'

import type { OrderFieldConfig, OrderFieldRenderContext } from '../types'

export function getFulfillmentValue(
    ctx: OrderFieldRenderContext,
    key: 'tracking_url' | 'tracking_number',
): string | undefined {
    const i = ctx.shippingEntryIndex ?? 0
    return ctx.order.fulfillments?.[i]?.[key] ?? undefined
}

export function getShippingLineCost(
    ctx: OrderFieldRenderContext,
): string | undefined {
    const i = ctx.shippingEntryIndex ?? 0
    const line = ctx.order.shipping_lines?.[i]
    return (
        line?.price_set?.shop_money?.amount ??
        (line?.price as string | undefined)
    )
}

export const SHIPPING_FIELD_DEFINITIONS: Record<string, OrderFieldConfig> = {
    tracking_url: {
        id: 'tracking_url',
        type: 'readonly',
        label: 'Tracking URL',
        getValue: (ctx) => getFulfillmentValue(ctx, 'tracking_url'),
    },
    tracking_number: {
        id: 'tracking_number',
        type: 'readonly',
        label: 'Tracking number',
        getValue: (ctx) => getFulfillmentValue(ctx, 'tracking_number'),
    },
    shipping_cost: {
        id: 'shipping_cost',
        type: 'readonly',
        label: 'Shipping cost',
        getValue: (ctx) => getShippingLineCost(ctx),
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
        getValue: (ctx) => {
            const i = ctx.shippingEntryIndex ?? 0
            return ctx.order.shipping_lines?.[i]?.code
        },
    },
}
