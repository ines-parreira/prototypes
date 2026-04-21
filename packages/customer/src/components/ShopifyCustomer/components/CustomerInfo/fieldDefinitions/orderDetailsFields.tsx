import { CopyableField } from '@repo/ecommerce/shopify/components'
import { formatOrderDate } from '@repo/ecommerce/shopify/utils'

import { Text } from '@gorgias/axiom'

import { OrderTags } from '../orders/OrderTags'
import type { OrderFieldConfig } from '../types'

import css from '../orders/sidePanel/OrderSidePanelPreview.less'

function CheckoutUrlField({ url }: { url: string }) {
    return (
        <CopyableField value={url} ariaLabel="Copy checkout URL" inline>
            <Text size="md" className={css.checkoutUrl}>
                {url}
            </Text>
        </CopyableField>
    )
}

export const FIELD_DEFINITIONS: Record<string, OrderFieldConfig> = {
    tags: {
        id: 'tags',
        type: 'component',
        label: 'Tags',
        getValue: (ctx) => ctx.order.tags,
        render: (ctx) => {
            if (!ctx.integrationId || ctx.order.id === undefined) return null
            return (
                <OrderTags
                    tags={ctx.order.tags}
                    integrationId={ctx.integrationId}
                    orderId={ctx.order.id}
                    ticketId={ctx.ticketId}
                    readOnly={ctx.isDraftOrder}
                />
            )
        },
    },
    store: {
        id: 'store',
        type: 'readonly',
        label: 'Store',
        copyable: true,
        getValue: (ctx) => ctx.storeName,
    },
    id: {
        id: 'id',
        type: 'readonly',
        label: 'ID',
        copyable: true,
        getValue: (ctx) => ctx.order.id,
    },
    created_at: {
        id: 'created_at',
        type: 'readonly',
        label: 'Created',
        copyable: true,
        getValue: (ctx) => ctx.order.created_at,
        copyValue: (_, ctx) => ctx.order.created_at,
        formatValue: (_, ctx) =>
            ctx.order.created_at
                ? formatOrderDate(
                      ctx.order.created_at,
                      ctx.dateFormat,
                      ctx.timeFormat,
                      ctx.timezone,
                  )
                : '-',
    },
    note: {
        id: 'note',
        type: 'readonly',
        label: 'Note',
        copyable: true,
        getValue: (ctx) => ctx.order.note,
    },
    invoice_url: {
        id: 'invoice_url',
        type: 'component',
        label: 'Checkout URL',
        getValue: (ctx) =>
            ctx.isDraftOrder ? ctx.order.invoice_url : undefined,
        render: (ctx) =>
            ctx.isDraftOrder && ctx.order.invoice_url ? (
                <CheckoutUrlField url={ctx.order.invoice_url} />
            ) : null,
    },
    discount_codes: {
        id: 'discount_codes',
        type: 'readonly',
        label: 'Discount codes',
        copyable: true,
        getValue: (ctx) => {
            const codes = ctx.order.discount_codes
            if (!codes || codes.length === 0) return undefined
            return codes.map((c) => c.code).join(', ')
        },
    },
}
