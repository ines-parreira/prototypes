import { formatCurrency } from '@repo/utils'
import pluralize from 'pluralize'

import { formatCreatedAt } from './customerInfoFields.utils'
import type { FieldConfig } from './types'

export const FIELD_DEFINITIONS: Record<string, FieldConfig> = {
    totalSpent: {
        id: 'totalSpent',
        type: 'readonly',
        label: 'Total spent',
        getValue: (ctx) => ctx.purchaseSummary?.amountSpent?.amount,
        formatValue: (_, ctx) =>
            formatCurrency(ctx.purchaseSummary?.amountSpent),
    },
    createdAt: {
        id: 'createdAt',
        type: 'readonly',
        label: 'Created at',
        getValue: (ctx) => ctx.shopper?.data.created_at,
        formatValue: (_, ctx) =>
            formatCreatedAt(
                ctx.shopper?.data.created_at,
                ctx.dateFormat,
                ctx.timeFormat,
            ),
    },
    orders: {
        id: 'orders',
        type: 'readonly',
        label: 'Orders',
        getValue: (ctx) => ctx.purchaseSummary?.numberOfOrders ?? 0,
        formatValue: (value) => {
            const count = (value as number) ?? 0
            return `${count} ${pluralize('order', count)}`
        },
    },
    note: {
        id: 'note',
        type: 'readonly',
        label: 'Note',
        getValue: (ctx) => ctx.shopper?.data?.note,
    },
}

export const DEFAULT_FIELD_IDS = [
    'totalSpent',
    'createdAt',
    'orders',
    'note',
] as const

export type FieldId = (typeof DEFAULT_FIELD_IDS)[number]
