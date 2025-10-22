import { GuidanceTemplate } from 'pages/aiAgent/types'

import { KnowledgeEditorGuidance } from './KnowledgeEditorGuidance/KnowledgeEditorGuidance'
import { GuidanceMode } from './KnowledgeEditorTopBar/KnowledgeEditorTopBarGuidanceControls'

type Props = {
    shopName: string
    shopType: string
    guidanceArticleId?: number
    guidanceTemplate?: GuidanceTemplate
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
