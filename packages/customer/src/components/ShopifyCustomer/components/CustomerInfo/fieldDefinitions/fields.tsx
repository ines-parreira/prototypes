import { formatCurrency } from '@repo/utils'
import pluralize from 'pluralize'

import { ShopifyTags } from '../tags/ShopifyTags'
import { formatTagCount } from '../tags/shopifyTags.utils'
import type { FieldConfig } from '../types'
import { formatCreatedAt } from './formatCreatedAt'

export const FIELD_DEFINITIONS: Record<string, FieldConfig> = {
    totalSpent: {
        id: 'totalSpent',
        type: 'readonly',
        label: 'Total spent',
        alwaysVisible: true,
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
        alwaysVisible: true,
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
    firstName: {
        id: 'firstName',
        type: 'readonly',
        label: 'First name',
        getValue: (ctx) => ctx.shopper?.data?.first_name,
    },
    lastName: {
        id: 'lastName',
        type: 'readonly',
        label: 'Last name',
        getValue: (ctx) => ctx.shopper?.data?.last_name,
    },
    email: {
        id: 'email',
        type: 'readonly',
        label: 'Email',
        getValue: (ctx) => ctx.shopper?.data?.email,
    },
    phone: {
        id: 'phone',
        type: 'readonly',
        label: 'Phone',
        getValue: (ctx) => ctx.shopper?.data?.phone ?? undefined,
    },
    currency: {
        id: 'currency',
        type: 'readonly',
        label: 'Currency',
        getValue: (ctx) => ctx.shopper?.data?.currency,
    },
    state: {
        id: 'state',
        type: 'readonly',
        label: 'State',
        getValue: (ctx) => ctx.shopper?.data?.state,
    },
    verifiedEmail: {
        id: 'verifiedEmail',
        type: 'readonly',
        label: 'Verified email',
        getValue: (ctx) =>
            ctx.shopper?.data?.verified_email != null
                ? String(ctx.shopper.data.verified_email)
                : undefined,
    },
    taxExempt: {
        id: 'taxExempt',
        type: 'readonly',
        label: 'Tax exempt',
        getValue: (ctx) =>
            ctx.shopper?.data?.tax_exempt != null
                ? String(ctx.shopper.data.tax_exempt)
                : undefined,
    },
    tags: {
        id: 'tags',
        type: 'component',
        label: 'Tags',
        getValue: (ctx) => ctx.shopper?.data?.tags,
        formatValue: (value) => formatTagCount(value as string | undefined),
        render: (ctx) => (
            <ShopifyTags
                tags={ctx.shopper?.data?.tags}
                integrationId={ctx.integrationId}
                externalId={ctx.externalId}
                customerId={ctx.customerId}
                ticketId={ctx.ticketId}
            />
        ),
    },
    lastOrderId: {
        id: 'lastOrderId',
        type: 'readonly',
        label: 'Last order ID',
        getValue: (ctx) => ctx.purchaseSummary?.lastOrderId,
    },
    id: {
        id: 'id',
        type: 'readonly',
        label: 'ID',
        getValue: (ctx) => ctx.shopper?.data?.id,
    },
    adminGraphqlApiId: {
        id: 'adminGraphqlApiId',
        type: 'readonly',
        label: 'Admin GraphQL API ID',
        getValue: (ctx) => ctx.shopper?.data?.admin_graphql_api_id,
    },
    multipassIdentifier: {
        id: 'multipassIdentifier',
        type: 'readonly',
        label: 'Multipass identifier',
        getValue: (ctx) => ctx.shopper?.data?.multipass_identifier ?? undefined,
    },
    taxExemptions: {
        id: 'taxExemptions',
        type: 'readonly',
        label: 'Tax exemptions',
        getValue: (ctx) =>
            ctx.shopper?.data?.tax_exemptions?.join(', ') || undefined,
    },
}
