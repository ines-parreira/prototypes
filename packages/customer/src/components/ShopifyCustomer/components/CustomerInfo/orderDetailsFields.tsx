import { useCopyToClipboard } from '@repo/hooks'
import {
    DateAndTimeFormatting,
    formatDatetime,
    getDateAndTimeFormat,
} from '@repo/utils'

import { Box, Button, Text } from '@gorgias/axiom'

import { OrderTags } from './OrderTags'
import type { OrderFieldConfig } from './types'

import css from './OrderSidePanelPreview.less'

function CheckoutUrlField({ url }: { url: string }) {
    const [, copyToClipboard] = useCopyToClipboard()

    return (
        <Box flexDirection="row" alignItems="center" gap="xxxs" minWidth={0}>
            <Text size="md" className={css.checkoutUrl}>
                {url}
            </Text>
            <Button
                as="button"
                icon="copy"
                intent="regular"
                size="sm"
                variant="tertiary"
                onClick={() => copyToClipboard(url)}
                aria-label="Copy checkout URL"
            />
        </Box>
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
        getValue: (ctx) => ctx.storeName,
    },
    id: {
        id: 'id',
        type: 'readonly',
        label: 'ID',
        getValue: (ctx) => ctx.order.id,
    },
    created_at: {
        id: 'created_at',
        type: 'readonly',
        label: 'Created',
        getValue: (ctx) => ctx.order.created_at,
        formatValue: (_, ctx) =>
            ctx.order.created_at
                ? formatDatetime(
                      ctx.order.created_at,
                      getDateAndTimeFormat(
                          ctx.dateFormat,
                          ctx.timeFormat,
                          DateAndTimeFormatting.RelativeDateAndTime,
                      ),
                  )
                : '-',
    },
    note: {
        id: 'note',
        type: 'readonly',
        label: 'Note',
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
        getValue: (ctx) => {
            const codes = ctx.order.discount_codes
            if (!codes || codes.length === 0) return undefined
            return codes.map((c) => c.code).join(', ')
        },
    },
}
