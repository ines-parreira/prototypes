import type { FilteredKnowledgeHubArticle } from 'pages/aiAgent/KnowledgeHub/types'
import type { GuidanceTemplate } from 'pages/aiAgent/types'

import { KnowledgeEditorGuidance } from './KnowledgeEditorGuidance/KnowledgeEditorGuidance'
import type { GuidanceMode } from './KnowledgeEditorTopBar/KnowledgeEditorTopBarGuidanceControls'

type Props = {
    shopName: string
    shopType: string
    guidanceArticleId?: number
    guidanceTemplate?: GuidanceTemplate
    guidanceArticles: FilteredKnowledgeHubArticle[]
    onClose: () => void
    onClickPrevious?: () => void
    onClickNext?: () => void
    onDelete?: () => void
    onCreate?: () => void
    onUpdate?: () => void
    guidanceMode: GuidanceMode['mode']
    isOpen: boolean
}

export const KnowledgeEditor = ({
    shopName,
    shopType,
    guidanceArticleId,
    guidanceTemplate,
    guidanceArticles,
    onClose,
    onClickPrevious,
    onClickNext,
    onDelete,
    onCreate,
    onUpdate,
    guidanceMode,
    isOpen,
}: Props) => {
    return (
        <KnowledgeEditorGuidance
            shopName={shopName}
            shopType={shopType}
            guidanceArticleId={guidanceArticleId}
            guidanceTemplate={guidanceTemplate}
            guidanceArticles={guidanceArticles}
            onClose={onClose}
            onClickPrevious={onClickPrevious}
            onClickNext={onClickNext}
            onDelete={onDelete}
            onCreate={onCreate}
            onUpdate={onUpdate}
            guidanceMode={guidanceMode}
            isOpen={isOpen}
        />
    )
}
