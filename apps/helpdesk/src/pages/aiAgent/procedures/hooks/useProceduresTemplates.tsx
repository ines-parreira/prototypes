import { useMemo } from 'react'

import { GuidanceTemplatesData } from 'pages/aiAgent/hooks/useGuidanceTemplates'
import type { ProcedureTemplate } from 'pages/aiAgent/procedures/types'
import type { GuidanceTemplate } from 'pages/aiAgent/types'

const TAG_STYLES = {
    Order: {
        color: 'content-accent-default',
        background: 'surface-accent-default',
    },
    Shipping: {
        color: 'content-additional-blue',
        background: 'surface-additional-blue',
    },
    Product: {
        color: 'content-warning-default',
        background: 'surface-warning-default',
    },
    ReturnExchanges: {
        color: 'content-error-default',
        background: 'elevation-neutral-default',
    },
    Subscriptions: {
        color: 'content-additional-fuschia',
        background: 'surface-additional-fuschia',
    },
    Promotions: {
        color: 'content-success-default',
        background: 'surface-success-default',
    },
} as const

const getGuidanceTemplate = (
    guidanceTemplates: GuidanceTemplate[],
    guidanceId: string,
) => guidanceTemplates.find(({ id }) => id === guidanceId)

export const ProcedureTemplatesData: Omit<ProcedureTemplate, 'guidance'>[] = [
    {
        id: 'order-status-tracking-or-delivery-timing',
        name: 'Order status, tracking or delivery timing',
        guidanceId:
            'when-the-customer-asks-about-order-status-tracking-or-delivery-timing',
        tag: 'Order',
        style: TAG_STYLES.Order,
        intents: [
            'order::status',
            'shipping::delay',
            'shipping::delivered not received',
        ],
    },
    {
        id: 'one-or-more-items-missing-from-an-order',
        name: 'One or more items missing from an order',
        guidanceId: 'when-the-customer-reports-items-missing-from-order',
        tag: 'Order',
        style: TAG_STYLES.Order,
        intents: ['order::missing item'],
    },
    {
        id: 'order-cancellations',
        name: 'Order cancellations',
        guidanceId: 'when-the-customer-asks-to-cancel-an-order',
        tag: 'Order',
        style: TAG_STYLES.Order,
        intents: ['order::cancel'],
    },
    {
        id: 'shipping-address-updates-or-edits-in-an-order',
        name: 'Shipping address updates or edits in an order',
        guidanceId:
            'when-the-customer-asks-to-edit-or-update-the-shipping-address',
        tag: 'Shipping',
        style: TAG_STYLES.Shipping,
        intents: ['shipping::change address'],
    },
    {
        id: 'product-edits-in-an-order',
        name: 'Product edits in an order (replace product, remove product)',
        guidanceId: 'when-the-customer-asks-to-edit-the-products-in-an-order',
        tag: 'Product',
        style: TAG_STYLES.Product,
        intents: ['order::edit'],
    },
    {
        id: 'item-is-damaged-defective-broken-or-not-working-as-expected',
        name: 'Item is damaged, defective, broken or not working as expected',
        guidanceId: 'when-the-customer-reports-item-damaged-defective-broken',
        tag: 'Product',
        style: TAG_STYLES.Product,
        intents: ['order::damaged', 'product::quality issues'],
    },
    {
        id: 'returns-and-exchanges',
        name: 'Returns and exchanges',
        guidanceId: 'when-the-customer-asks-about-return-exchange-or-refund',
        tag: 'Return & exchanges',
        style: TAG_STYLES.ReturnExchanges,
        intents: [
            'return::request',
            'return::status',
            'return::information',
            'return::other',
            'exchange::request',
            'exchange::status',
            'exchange::other',
        ],
    },
    {
        id: 'promo-codes-and-free-shipping',
        name: 'Promo codes and free shipping',
        guidanceId: 'when-the-customer-asks-about-promo-codes-or-free-shipping',
        tag: 'Promotion',
        style: TAG_STYLES.Promotions,
        intents: [
            'promotion & discount::information',
            'promotion & discount::issue',
            'promotion & discount::other',
        ],
    },
    {
        id: 'subscription-modification',
        name: 'Subscription modification (pause, skip, resume)',
        guidanceId: 'when-the-customer-asks-to-modify-their-subscription',
        tag: 'Subscription',
        style: TAG_STYLES.Subscriptions,
        intents: ['subscription::modification', 'subscription::other'],
    },
    {
        id: 'subscription-cancellations',
        name: 'Subscription cancellations',
        guidanceId: 'when-the-customer-asks-to-cancel-their-subscription',
        tag: 'Subscription',
        style: TAG_STYLES.Subscriptions,
        intents: ['subscription::cancel'],
    },
]

export const useProceduresTemplates = () => {
    const proceduresTemplates = useMemo(
        () =>
            ProcedureTemplatesData.map((template) => ({
                ...template,
                guidance: getGuidanceTemplate(
                    GuidanceTemplatesData,
                    template.guidanceId,
                ),
            })),
        [],
    )

    return { proceduresTemplates }
}
