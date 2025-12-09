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
