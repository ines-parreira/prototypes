import {
    CopyableField,
    OrderDateLabel,
} from '@repo/ecommerce/shopify/components'

import { OrderNote } from '../orders/OrderNote'
import { OrderTags } from '../orders/OrderTags'
import type { OrderFieldConfig } from '../types'

import css from '../orders/sidePanel/OrderSidePanelPreview.less'

function CheckoutUrlField({ url }: { url: string }) {
    return (
        <CopyableField value={url} ariaLabel="Copy checkout URL" inline>
            <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className={css.checkoutUrl}
            >
                {url}
            </a>
        </CopyableField>
    )
}

function OrderStatusUrlField({ url }: { url: string }) {
    return (
        <CopyableField value={url} ariaLabel="Copy order status URL" inline>
            <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className={css.checkoutUrl}
            >
                {url}
            </a>
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
            if (ctx.isDraftOrder && !ctx.order.tags) return null
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
        type: 'component',
        label: 'Created',
        copyable: true,
        getValue: (ctx) => ctx.order.created_at,
        copyValue: (_, ctx) => ctx.order.created_at,
        render: (ctx) =>
            ctx.order.created_at ? (
                <OrderDateLabel createdAt={ctx.order.created_at} />
            ) : null,
    },
    note: {
        id: 'note',
        type: 'component',
        label: 'Note',
        getValue: (ctx) => ctx.order.note,
        render: (ctx) => {
            if (!ctx.integrationId || ctx.order.id === undefined) return null
            return (
                <OrderNote
                    note={ctx.order.note}
                    integrationId={ctx.integrationId}
                    orderId={ctx.order.id}
                    ticketId={ctx.ticketId}
                    readOnly={ctx.isDraftOrder}
                />
            )
        },
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
    order_status_url: {
        id: 'order_status_url',
        type: 'component',
        label: 'Order status URL',
        getValue: (ctx) =>
            !ctx.isDraftOrder ? ctx.order.order_status_url : undefined,
        render: (ctx) =>
            !ctx.isDraftOrder && ctx.order.order_status_url ? (
                <OrderStatusUrlField url={ctx.order.order_status_url} />
            ) : null,
    },
}
