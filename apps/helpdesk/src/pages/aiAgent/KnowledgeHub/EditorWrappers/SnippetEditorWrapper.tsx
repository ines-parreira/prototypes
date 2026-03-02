import { useEffect, useState } from 'react'

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
    // Cache the last valid snippet so KnowledgeEditor keeps rendering
    // with real data during the close animation (when props are cleared).
    const [lastKnownSnippet, setLastKnownSnippet] = useState<{
        id: number
        type: SnippetType
    } | null>(
        currentArticleId && snippetType
            ? { id: currentArticleId, type: snippetType }
            : null,
    )

    useEffect(() => {
        if (!currentArticleId || !snippetType) {
            return
        }

        setLastKnownSnippet({ id: currentArticleId, type: snippetType })
    }, [currentArticleId, snippetType])

    if (!lastKnownSnippet) {
        return null
    }

    return (
        <KnowledgeEditor
            variant="snippet"
            shopName={shopName}
            snippetId={lastKnownSnippet.id}
            snippetType={lastKnownSnippet.type}
            onClose={onClose}
            onUpdated={onUpdate}
            onClickPrevious={onClickPrevious}
            onClickNext={onClickNext}
            isOpen={isOpen}
            handleVisibilityUpdate={handleVisibilityUpdate}
        />
    )
}
