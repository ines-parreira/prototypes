import { calculateGuidanceLimit } from '../../../components/KnowledgeEditor/KnowledgeEditorGuidance/context/guidanceLimitUtils'
import type {
    FilteredKnowledgeHubArticle,
    GroupedKnowledgeItem,
} from '../../types'
import { KnowledgeType } from '../../types'
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

export function getAIAgentButtonConfig(
    selectedItems: GroupedKnowledgeItem[],
    action: 'enable' | 'disable',
): {
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
            tooltipMessage:
                action === 'enable'
                    ? TOOLTIP_MESSAGES.enableOnlyFAQ
                    : TOOLTIP_MESSAGES.disableOnlyFAQ,
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
    duplicateWithSnippets: 'De-select snippets to perform this action',
    duplicateWithFAQ: 'De-select Help Center articles to perform this action',
    delete: 'De-select snippets to perform this action',
    aiAgentOnlyFAQ: 'This action is not supported at the moment',
    aiAgentMixedFAQ: 'De-select Help Center articles to perform this action',
    enableOnlyFAQ:
        'Publish and make articles public to enable them for AI Agent',
    disableOnlyFAQ:
        'Change article visibility to unlisted to disable for AI Agent',
}
