import { calculateGuidanceLimit } from '../../../components/KnowledgeEditor/KnowledgeEditorGuidance/context/guidanceLimitUtils'
import type {
    FilteredKnowledgeHubArticle,
    GroupedKnowledgeItem,
} from '../../types'
import { KnowledgeType } from '../../types'
import { isDraft } from '../../utils/articleUtils'
import { ButtonRenderMode } from './types'
import type { TooltipConfig } from './types'

export function getDuplicateButtonMode(
    selectedItems: GroupedKnowledgeItem[],
    isAllContentView: boolean,
): { mode: ButtonRenderMode; tooltipMessage?: string } {
    const isAllGuidance =
        selectedItems.length > 0 &&
        selectedItems.every((item) => item.type === KnowledgeType.Guidance)

    if (isAllGuidance) {
        return { mode: ButtonRenderMode.Visible }
    }

    if (isAllContentView) {
        const selectedTypes = new Set(selectedItems.map((item) => item.type))
        const hasFAQ = selectedTypes.has(KnowledgeType.FAQ)
        const hasSnippets =
            selectedTypes.has(KnowledgeType.Document) ||
            selectedTypes.has(KnowledgeType.URL) ||
            selectedTypes.has(KnowledgeType.Domain)

        let tooltipMessage: string
        if (hasSnippets) {
            // If snippets are selected (with or without FAQ), prioritize snippet message
            tooltipMessage = TOOLTIP_MESSAGES.duplicateWithSnippets
        } else if (hasFAQ) {
            // If only FAQ is selected (no snippets)
            tooltipMessage = TOOLTIP_MESSAGES.duplicateWithFAQ
        } else {
            // Fallback message for any other non-guidance selection
            tooltipMessage = TOOLTIP_MESSAGES.duplicateWithSnippets
        }

        return {
            mode: ButtonRenderMode.DisabledWithTooltip,
            tooltipMessage,
        }
    }

    return { mode: ButtonRenderMode.Hidden }
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

/**
 * Checks if any selected items contain draft guidance.
 *
 * Draft guidance is guidance that either:
 * - Has never been published (no publishedVersionId)
 * - Has unpublished changes (draftVersionId !== publishedVersionId)
 *
 * @param selectedItems - Array of selected knowledge items
 * @returns true if any guidance item is in draft status
 */
function hasDraftGuidance(selectedItems: GroupedKnowledgeItem[]): boolean {
    return selectedItems.some(
        (item) =>
            item.type === KnowledgeType.Guidance &&
            isDraft({
                id: parseInt(item.id, 10),
                draftVersionId: item.draftVersionId,
                publishedVersionId: item.publishedVersionId,
            }),
    )
}

function hasDraftFAQ(selectedItems: GroupedKnowledgeItem[]): boolean {
    return selectedItems.some(
        (item) =>
            item.type === KnowledgeType.FAQ &&
            isDraft({
                id: parseInt(item.id, 10),
                draftVersionId: item.draftVersionId,
                publishedVersionId: item.publishedVersionId,
            }),
    )
}

export function getAIAgentButtonConfig(selectedItems: GroupedKnowledgeItem[]): {
    mode: ButtonRenderMode
    tooltipMessage?: string
} {
    if (selectedItems.length === 0) {
        return { mode: ButtonRenderMode.Hidden }
    }

    const hasDraftGuidanceItems = hasDraftGuidance(selectedItems)
    const hasDraftFAQItems = hasDraftFAQ(selectedItems)

    if (hasDraftGuidanceItems && hasDraftFAQItems) {
        return {
            mode: ButtonRenderMode.DisabledWithTooltip,
            tooltipMessage: TOOLTIP_MESSAGES.aiAgentDraftAndFAQ,
        }
    }

    if (hasDraftGuidanceItems) {
        return {
            mode: ButtonRenderMode.DisabledWithTooltip,
            tooltipMessage: TOOLTIP_MESSAGES.aiAgentOnlyDraft,
        }
    }

    if (hasDraftFAQItems) {
        return {
            mode: ButtonRenderMode.DisabledWithTooltip,
            tooltipMessage: TOOLTIP_MESSAGES.aiAgentDraftFAQ,
        }
    }

    return { mode: ButtonRenderMode.Visible }
}

export function getBulkEnableButtonConfig(
    guidanceArticles: FilteredKnowledgeHubArticle[],
): {
    mode: ButtonRenderMode
    tooltipMessage?: string
} {
    const { isAtLimit, limitMessage } = calculateGuidanceLimit(guidanceArticles)

    if (isAtLimit) {
        return {
            mode: ButtonRenderMode.DisabledWithTooltip,
            tooltipMessage: limitMessage,
        }
    }

    return { mode: ButtonRenderMode.Visible }
}

export const TOOLTIP_MESSAGES: TooltipConfig = {
    duplicateWithSnippets: 'De-select snippets to perform this action.',
    duplicateWithFAQ: 'De-select Help Center articles to perform this action.',
    delete: 'De-select snippets to perform this action.',
    aiAgentOnlyDraft: 'De-select draft guidance to perform this action.',
    aiAgentDraftAndFAQ:
        'De-select draft guidance and draft Help Center articles to perform this action.',
    aiAgentDraftFAQ:
        'De-select draft Help Center articles to perform this action. Only published articles can be used.',
}
