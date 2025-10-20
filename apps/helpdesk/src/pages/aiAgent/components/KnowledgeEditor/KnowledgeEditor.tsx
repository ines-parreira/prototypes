import { KnowledgeEditorGuidance } from './KnowledgeEditorGuidance/KnowledgeEditorGuidance'
import { GuidanceMode } from './KnowledgeEditorTopBar/KnowledgeEditorTopBarGuidanceControls'

type Props = {
    shopName: string
    shopType: string
    guidanceArticleId: number
    onClose: () => void
    onClickPrevious: () => void
    onClickNext: () => void
    guidanceMode: GuidanceMode['mode']
}

export const KnowledgeEditor = ({
    shopName,
    shopType,
    guidanceArticleId,
    onClose,
    onClickPrevious,
    onClickNext,
    guidanceMode,
}: Props) => {
    return (
        <KnowledgeEditorGuidance
            shopName={shopName}
            shopType={shopType}
            guidanceArticleId={guidanceArticleId}
            onClose={onClose}
            onClickPrevious={onClickPrevious}
            onClickNext={onClickNext}
            guidanceMode={guidanceMode}
        />
    )
}
