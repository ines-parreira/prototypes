import type { GroupedKnowledgeItem } from '../../types'
import { KnowledgeType } from '../../types'
import { ButtonRenderMode } from './types'
import type { TooltipConfig } from './types'

export function getDuplicateButtonMode(
    selectedItems: GroupedKnowledgeItem[],
    isAllContentView: boolean,
): ButtonRenderMode {
    const isAllGuidance =
        selectedItems.length > 0 &&
        selectedItems.every((item) => item.type === KnowledgeType.Guidance)

    if (isAllGuidance) {
        return ButtonRenderMode.Visible
    }

    if (isAllContentView) {
        return ButtonRenderMode.DisabledWithTooltip
    }

    return ButtonRenderMode.Hidden
}

export function getDeleteButtonMode(
    selectedItems: GroupedKnowledgeItem[],
    isAllContentView: boolean,
): ButtonRenderMode {
    const hasSnippets = selectedItems.some(
        (item) =>
            item.type === KnowledgeType.Domain ||
            item.type === KnowledgeType.Document ||
            item.type === KnowledgeType.URL,
    )

    if (isAllContentView && hasSnippets) {
        return ButtonRenderMode.DisabledWithTooltip
    }
    if (!isAllContentView && hasSnippets) {
        return ButtonRenderMode.Hidden
    }

    return ButtonRenderMode.Visible
}

export function getAIAgentButtonConfig(selectedItems: GroupedKnowledgeItem[]): {
    mode: ButtonRenderMode
    tooltipMessage?: string
} {
    if (selectedItems.length === 0) {
        return { mode: ButtonRenderMode.Hidden }
    }

    const selectedTypes = new Set(selectedItems.map((item) => item.type))
    const hasFAQ = selectedTypes.has(KnowledgeType.FAQ)
    const hasOnlyFAQ = selectedTypes.size === 1 && hasFAQ

    if (hasOnlyFAQ) {
        return {
            mode: ButtonRenderMode.DisabledWithTooltip,
            tooltipMessage: TOOLTIP_MESSAGES.aiAgentOnlyFAQ,
        }
    }

    if (hasFAQ) {
        return {
            mode: ButtonRenderMode.DisabledWithTooltip,
            tooltipMessage: TOOLTIP_MESSAGES.aiAgentMixedFAQ,
        }
    }

    return { mode: ButtonRenderMode.Visible }
}

export const TOOLTIP_MESSAGES: TooltipConfig = {
    duplicate:
        'De-select articles and snippets from external sources to perform this action',
    delete: 'De-select snippets to perform this action',
    aiAgentOnlyFAQ: 'This action is not supported at the moment',
    aiAgentMixedFAQ: 'De-select Help Center articles to perform this action',
}

// DuplicateSelect utility functions

/**
 * Removes the "(current)" suffix from a store name
 */
export function cleanStoreName(storeName: string): string {
    return storeName.replace(/\s*\(current\)$/, '')
}

/**
 * Checks if a store name matches the current shop
 */
export function isCurrentStore(storeName: string, shopName?: string): boolean {
    return storeName === shopName || storeName === `${shopName} (current)`
}

/**
 * Creates an HTML link for a store
 */
export function createStoreLink(storeName: string): string {
    const cleanName = cleanStoreName(storeName)
    const storeUrl = `/app/ai-agent/shopify/${cleanName}/knowledge`
    return `<a href="${storeUrl}">${cleanName}</a>`
}

type StoreItem = {
    name: string
}

/**
 * Builds the notification message for duplicate guidance action
 */
export function buildDuplicateNotificationMessage(
    selectedStores: StoreItem[],
    shopName?: string,
): string {
    const currentStoreSelected = selectedStores.some((store) =>
        isCurrentStore(store.name, shopName),
    )
    const otherStores = selectedStores.filter(
        (store) => !isCurrentStore(store.name, shopName),
    )

    if (currentStoreSelected && otherStores.length === 0) {
        return 'Guidance duplicated'
    }

    const storeLinks = otherStores
        .map((store) => createStoreLink(store.name))
        .join(', ')

    if (currentStoreSelected) {
        return `Guidance duplicated to ${shopName} and ${storeLinks}`
    }

    return `Guidance duplicated to ${storeLinks}`
}
