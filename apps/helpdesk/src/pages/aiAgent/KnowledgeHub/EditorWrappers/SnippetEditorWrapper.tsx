import { KnowledgeEditorSnippet } from '../../components/KnowledgeEditor/KnowledgeEditorSnippet/KnowledgeEditorSnippet'
import type { SnippetType } from '../types'

type SnippetEditorWrapperProps = {
    shopName: string
    isOpen: boolean
    currentArticleId?: number
    snippetType?: SnippetType
    onClose: () => void
    onUpdate: () => void
    onClickPrevious: () => void
    onClickNext: () => void
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
}: SnippetEditorWrapperProps) => {
    if (!isOpen || !currentArticleId || !snippetType) {
        return null
    }

    return (
        <KnowledgeEditorSnippet
            shopName={shopName}
            snippetId={currentArticleId}
            snippetType={snippetType}
            onClose={onClose}
            onUpdated={onUpdate}
            onClickPrevious={onClickPrevious}
            onClickNext={onClickNext}
            isOpen={isOpen}
        />
    )
}
