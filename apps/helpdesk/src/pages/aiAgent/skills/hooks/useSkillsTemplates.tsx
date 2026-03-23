import { useMemo } from 'react'

import { useListIntents } from 'models/helpCenter/queries'
import { GuidanceTemplatesData } from 'pages/aiAgent/hooks/useGuidanceTemplates'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { IntentStatus } from 'pages/aiAgent/skills/types'
import type { Intent, SkillTemplate } from 'pages/aiAgent/skills/types'
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

type SkillTemplateConfig = Omit<SkillTemplate, 'guidance' | 'intents'> & {
    intentNames: Intent['name'][]
}

export const SkillTemplatesData: SkillTemplateConfig[] = [
    {
        id: 'order-status-tracking-or-delivery-timing',
        name: 'Order status, tracking or delivery timing',
        guidanceId:
            'when-the-customer-asks-about-order-status-tracking-or-delivery-timing',
        tag: 'Order',
        style: TAG_STYLES.Order,
        intentNames: [
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
        intentNames: ['order::missing item'],
    },
    {
        id: 'order-cancellations',
        name: 'Order cancellations',
        guidanceId: 'when-the-customer-asks-to-cancel-an-order',
        tag: 'Order',
        style: TAG_STYLES.Order,
        intentNames: ['order::cancel'],
    },
    {
        id: 'shipping-address-updates-or-edits-in-an-order',
        name: 'Shipping address updates or edits in an order',
        guidanceId:
            'when-the-customer-asks-to-edit-or-update-the-shipping-address',
        tag: 'Shipping',
        style: TAG_STYLES.Shipping,
        intentNames: ['shipping::change address'],
    },
    {
        id: 'product-edits-in-an-order',
        name: 'Product edits in an order (replace product, remove product)',
        guidanceId: 'when-the-customer-asks-to-edit-the-products-in-an-order',
        tag: 'Product',
        style: TAG_STYLES.Product,
        intentNames: ['order::edit'],
    },
    {
        id: 'item-is-damaged-defective-broken-or-not-working-as-expected',
        name: 'Item is damaged, defective, broken or not working as expected',
        guidanceId: 'when-the-customer-reports-item-damaged-defective-broken',
        tag: 'Product',
        style: TAG_STYLES.Product,
        intentNames: ['order::damaged', 'product::quality issues'],
    },
    {
        id: 'returns-and-exchanges',
        name: 'Returns and exchanges',
        guidanceId: 'when-the-customer-asks-about-return-exchange-or-refund',
        tag: 'Return & exchanges',
        style: TAG_STYLES.ReturnExchanges,
        intentNames: [
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
        intentNames: [
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
        intentNames: ['subscription::modification', 'subscription::other'],
    },
    {
        id: 'subscription-cancellations',
        name: 'Subscription cancellations',
        guidanceId: 'when-the-customer-asks-to-cancel-their-subscription',
        tag: 'Subscription',
        style: TAG_STYLES.Subscriptions,
        intentNames: ['subscription::cancel'],
    },
]

export const useSkillsTemplates = (): SkillTemplate[] => {
    const { isLoading: isLoadingStoreConfiguration, storeConfiguration } =
        useAiAgentStoreConfigurationContext()

    const helpCenterId = storeConfiguration?.guidanceHelpCenterId

    const { data } = useListIntents(helpCenterId || 0, {
        enabled: !isLoadingStoreConfiguration && !!helpCenterId,
    })

    const intentsByName = useMemo(() => {
        const map = new Map<string, Intent>()
        ;(data?.intents ?? []).forEach((intent) => map.set(intent.name, intent))
        return map
    }, [data])

    const mappedSkillsTemplates = useMemo(
        () =>
            SkillTemplatesData.map(({ intentNames, ...template }) => ({
                ...template,
                guidance: getGuidanceTemplate(
                    GuidanceTemplatesData,
                    template.guidanceId,
                ),
                intents: intentNames.map(
                    (name) =>
                        intentsByName.get(name) ?? {
                            name,
                            status: IntentStatus.NotLinked,
                            help_center_id: helpCenterId || 0,
                            articles: [],
                        },
                ),
            })),
        [intentsByName, helpCenterId],
    )

    return mappedSkillsTemplates
}
