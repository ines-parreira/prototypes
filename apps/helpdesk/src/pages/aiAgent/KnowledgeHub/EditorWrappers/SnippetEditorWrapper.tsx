import { KnowledgeEditor } from '../../components/KnowledgeEditor/KnowledgeEditor'
import type { SnippetType } from '../types'

type SnippetEditorWrapperProps = {
    shopName: string
    isOpen: boolean
    currentArticleId?: number
    snippetType?: SnippetType
    onClose: () => void
    onUpdate: () => void
    onClickPrevious?: () => void
    onClickNext?: () => void
    handleVisibilityUpdate?: (visibility: string) => void
}

export const SnippetEditorWrapper = ({
    shopName,
    isOpen,
    currentArticleId,
    snippetType,
    onClose,
    onUpdate,
    onClickPrevious,
    onClickNext,
    handleVisibilityUpdate,
}: SnippetEditorWrapperProps) => {
    if (!isOpen || !currentArticleId || !snippetType) {
        return null
    }

    return (
        <KnowledgeEditor
            variant="snippet"
            shopName={shopName}
            snippetId={currentArticleId}
            snippetType={snippetType}
            onClose={onClose}
            onUpdated={onUpdate}
            onClickPrevious={onClickPrevious}
            onClickNext={onClickNext}
            isOpen={isOpen}
            handleVisibilityUpdate={handleVisibilityUpdate}
        />
    )
}
