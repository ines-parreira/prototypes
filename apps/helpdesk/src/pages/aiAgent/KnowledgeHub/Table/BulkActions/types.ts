import type { FilteredKnowledgeHubArticle } from '../../types'

export type BulkActionButtonProps = {
    onClick: () => void
    isDisabled: boolean
    renderMode?: ButtonRenderMode
    tooltipMessage?: string
    guidanceArticles?: FilteredKnowledgeHubArticle[]
}

export enum ButtonRenderMode {
    Visible = 'visible',
    DisabledWithTooltip = 'disabled-with-tooltip',
    Hidden = 'hidden',
}

export type TooltipConfig = {
    duplicateWithSnippets: string
    duplicateWithFAQ: string
    delete: string
    aiAgentOnlyFAQ: string
    aiAgentMixedFAQ: string
    enableOnlyFAQ: string
    disableOnlyFAQ: string
    aiAgentOnlyDraft: string
    aiAgentDraftAndFAQ: string
}
