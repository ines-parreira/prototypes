import type { MetafieldType } from '@gorgias/helpdesk-types'

import type { ShopifyIntegration } from 'models/integration/types'
import { IdentifierCategoryKey } from 'models/rule/types'
import getMetafieldOperators, {
    METAFIELD_TYPES_SUPPORTED_IN_RULES,
} from 'pages/common/components/ViewTable/Filters/utils/getMetafieldOperators'
import type { Field } from 'pages/settings/storeManagement/storeDetailsPage/ShopifyMetafields/MetafieldsTable/types'
import type { SupportedCategories } from 'pages/settings/storeManagement/storeDetailsPage/ShopifyMetafields/types'

import { getMetafieldWidgetConfig } from '../../utils/getMetafieldWidgetConfig'
import { METAFIELD_CATEGORY_KEYS } from './constants'
import type { SyntaxTreeLeaves } from './types'

export type WidgetOption = {
    label: string
    value: string
}

type WidgetOptionOrString = WidgetOption | string

export function hasMetafieldInPath(
    syntaxTreeLeaves: SyntaxTreeLeaves,
): boolean {
    if (!syntaxTreeLeaves) {
        return false
    }
    return syntaxTreeLeaves.join('.').includes('.metafields.')
}

export function extractMetafieldKeyFromTree(
    syntaxTreeLeaves: SyntaxTreeLeaves,
    hasMetafieldInTree: boolean,
): string | null {
    if (!hasMetafieldInTree || !syntaxTreeLeaves) {
        return null
    }
    const leaves = syntaxTreeLeaves.toArray() as string[]
    const metafieldsIdx = leaves.indexOf('metafields')
    if (metafieldsIdx !== -1 && leaves[metafieldsIdx + 1]) {
        const key = leaves[metafieldsIdx + 1]
        if (key !== 'value') {
            return key
        }
    }
    return null
}

export function extractMetafieldCategoryFromTree(
    syntaxTreeLeaves: SyntaxTreeLeaves,
    hasMetafieldInTree: boolean,
): SupportedCategories | null {
    if (!hasMetafieldInTree || !syntaxTreeLeaves) {
        return null
    }
    const path = syntaxTreeLeaves.join('.')
    if (
        path.includes('shopify.customer.metafields') ||
        /integrations\.\d+\.customer\.metafields/.test(path)
    ) {
        return 'Customer'
    }
    if (
        path.includes('shopify.last_order.metafields') ||
        /integrations\.\d+\.orders\.0\.metafields/.test(path)
    ) {
        return 'Order'
    }
    if (
        path.includes('shopify.last_draft_order.metafields') ||
        /integrations\.\d+\.draft_orders\.0\.metafields/.test(path)
    ) {
        return 'DraftOrder'
    }
    return null
}

export function extractIntegrationIdFromTree(
    syntaxTreeLeaves: SyntaxTreeLeaves,
): number | null {
    if (!syntaxTreeLeaves) return null
    const path = syntaxTreeLeaves.join('.')
    const match = path.match(/integrations\.(\d+)\./)
    return match ? parseInt(match[1], 10) : null
}

export function parsePathToExpressionSegments(fullPath: string): string[] {
    const segments = fullPath.split('.')
    const expressionSegments: string[] = []

    for (const segment of segments) {
        const bracketMatch = segment.match(/(\w+)\[(\d+)\]/)
        if (bracketMatch) {
            expressionSegments.push(bracketMatch[1])
            expressionSegments.push(bracketMatch[2])
        } else {
            expressionSegments.push(segment)
        }
    }

    return expressionSegments
}

export function getDisplayStoreName(
    selectedStore: ShopifyIntegration | null,
    integrationIdFromTree: number | null,
    shopifyIntegrations: ShopifyIntegration[],
): string | null {
    if (selectedStore) {
        return selectedStore.name
    }
    if (integrationIdFromTree) {
        const matchingStore = findStoreById(
            shopifyIntegrations,
            integrationIdFromTree,
        )
        return matchingStore?.name ?? null
    }
    return null
}

export function getActiveIntegrationId(
    selectedStoreId: number | undefined,
    integrationIdFromTree: number | null,
    firstIntegrationId: number | undefined,
): number | undefined {
    return selectedStoreId ?? integrationIdFromTree ?? firstIntegrationId
}

export function filterSupportedMetafields(metafields: Field[]): Field[] {
    return metafields.filter((field) =>
        METAFIELD_TYPES_SUPPORTED_IN_RULES.includes(field.type),
    )
}

export function findStoreById(
    integrations: ShopifyIntegration[],
    id: number,
): ShopifyIntegration | undefined {
    return integrations.find((store) => store.id === id)
}

export function findMetafieldByKey(
    metafields: Field[],
    key: string,
): Field | undefined {
    return metafields.find((f) => f.key === key)
}

export function isMetafieldCategory(category: IdentifierCategoryKey): boolean {
    return METAFIELD_CATEGORY_KEYS.includes(
        category as (typeof METAFIELD_CATEGORY_KEYS)[number],
    )
}

export function getMetafieldCategoryType(
    category: IdentifierCategoryKey,
): SupportedCategories | null {
    switch (category) {
        case IdentifierCategoryKey.ShopifyCustomerMetafields:
            return 'Customer'
        case IdentifierCategoryKey.ShopifyLastOrderMetafields:
            return 'Order'
        case IdentifierCategoryKey.ShopifyLastDraftOrderMetafields:
            return 'DraftOrder'
        default:
            return null
    }
}

export function getMetafieldOperatorOptions(
    metafieldType: MetafieldType | undefined,
): WidgetOption[] {
    const operators = getMetafieldOperators(metafieldType)
    return Object.entries(operators).map(([key, value]) => ({
        value: key,
        label: (value as { label?: string })?.label || key,
    }))
}

type WidgetConfig<T extends WidgetOptionOrString = WidgetOption> = {
    type: string
    options?: T[]
}

export function applyMetafieldWidgetConfig<T extends WidgetOptionOrString>(
    widget: WidgetConfig<T>,
    metafieldType: MetafieldType | undefined,
    operatorName: string | undefined,
): WidgetConfig<T | WidgetOption> {
    const config = getMetafieldWidgetConfig(metafieldType, operatorName)
    if (!config) {
        return widget
    }

    return {
        ...widget,
        type: config.type,
        ...(config.options && { options: config.options }),
    }
}
