import { useCallback, useState } from 'react'

import type { KnowledgeType, SnippetType } from '../types'
import { mapKnowledgeTypeToSnippetType } from '../types'
import { useKnowledgeHubEditor } from './useKnowledgeHubEditor'

type UseKnowledgeHubSnippetEditorParams = {
    shopName: string
    filteredSnippetArticles: Array<{
        id: number
        title: string
        type: KnowledgeType
    }>
}

export const useKnowledgeHubSnippetEditor = ({
    shopName,
    filteredSnippetArticles,
}: UseKnowledgeHubSnippetEditorParams) => {
    const [currentSnippetType, setCurrentSnippetType] = useState<
        SnippetType | undefined
    >(undefined)

    const editor = useKnowledgeHubEditor({
        type: 'snippet',
        shopName,
        filteredArticles: filteredSnippetArticles,
    })

    const openEditorForEdit = useCallback(
        (articleId: number, knowledgeType: KnowledgeType) => {
            const snippetType = mapKnowledgeTypeToSnippetType(knowledgeType)
            setCurrentSnippetType(snippetType)
            editor.openEditorForEdit(articleId)
        },
        [editor],
    )

    const closeEditor = useCallback(() => {
        setCurrentSnippetType(undefined)
        editor.closeEditor()
    }, [editor])

    const handleClickPrevious = useCallback(() => {
        if (editor.hasPrevious && editor.currentArticleId) {
            const currentIndex = filteredSnippetArticles.findIndex(
                (article) => article.id === editor.currentArticleId,
            )
            if (currentIndex > 0) {
                const previousArticle =
                    filteredSnippetArticles[currentIndex - 1]
                const snippetType = mapKnowledgeTypeToSnippetType(
                    previousArticle.type,
                )
                setCurrentSnippetType(snippetType)
            }
        }
        editor.handleClickPrevious()
    }, [editor, filteredSnippetArticles])

    const handleClickNext = useCallback(() => {
        if (editor.hasNext && editor.currentArticleId) {
            const currentIndex = filteredSnippetArticles.findIndex(
                (article) => article.id === editor.currentArticleId,
            )
            if (currentIndex < filteredSnippetArticles.length - 1) {
                const nextArticle = filteredSnippetArticles[currentIndex + 1]
                const snippetType = mapKnowledgeTypeToSnippetType(
                    nextArticle.type,
                )
                setCurrentSnippetType(snippetType)
            }
        }
        editor.handleClickNext()
    }, [editor, filteredSnippetArticles])

    return {
        isEditorOpen: editor.isEditorOpen,
        currentArticleId: editor.currentArticleId,
        currentSnippetType,
        openEditorForEdit,
        closeEditor,
        handleUpdate: editor.handleUpdate,
        hasPrevious: editor.hasPrevious,
        hasNext: editor.hasNext,
        handleClickPrevious,
        handleClickNext,
    }
}
