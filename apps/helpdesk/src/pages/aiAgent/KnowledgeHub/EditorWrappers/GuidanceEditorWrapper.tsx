import { KnowledgeEditor } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditor'
import type { GuidanceMode } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorTopBar/KnowledgeEditorTopBarGuidanceControls'
import type { GuidanceTemplate } from 'pages/aiAgent/types'

type GuidanceEditorWrapperProps = {
    shopName: string
    shopType: string
    guidanceArticleId?: number
    guidanceTemplate?: GuidanceTemplate
    guidanceMode: GuidanceMode['mode']
    isOpen: boolean
    onClose: () => void
    onCreate?: () => void
    onUpdate?: () => void
    onDelete?: () => void
    onClickPrevious?: () => void
    onClickNext?: () => void
    handleVisibilityUpdate?: (visibility: string) => void
}

export const GuidanceEditorWrapper = ({
    shopName,
    shopType,
    guidanceArticleId,
    guidanceTemplate,
    guidanceMode,
    isOpen,
    onClose,
    onCreate,
    onUpdate,
    onDelete,
    onClickPrevious,
    onClickNext,
    handleVisibilityUpdate,
}: GuidanceEditorWrapperProps) => {
    return (
        <KnowledgeEditor
            variant="guidance"
            shopName={shopName}
            shopType={shopType}
            guidanceArticleId={guidanceArticleId}
            guidanceTemplate={guidanceTemplate}
            guidanceMode={guidanceMode}
            isOpen={isOpen}
            onClose={onClose}
            onCreate={onCreate}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onClickPrevious={onClickPrevious}
            onClickNext={onClickNext}
            handleVisibilityUpdate={handleVisibilityUpdate}
        />
    )
}
