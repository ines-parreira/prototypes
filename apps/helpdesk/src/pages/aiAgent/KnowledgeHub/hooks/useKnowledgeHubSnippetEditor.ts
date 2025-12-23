import { useCallback, useState } from 'react'

import type {
    KnowledgeType,
    SnippetType,
    UseKnowledgeHubSnippetEditorParams,
} from '../types'
import { mapKnowledgeTypeToSnippetType } from '../types'
import { useKnowledgeHubEditor } from './useKnowledgeHubEditor'

export const useKnowledgeHubSnippetEditor = ({
    shopName,
    filteredSnippetArticles,
    history,
    routes,
    buildUrlWithParams,
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

                const basePath = routes.knowledgeArticle(
                    previousArticle.type,
                    previousArticle.id,
                )
                const targetPath = buildUrlWithParams(basePath)
                history.replace(targetPath)
            }
        }
        editor.handleClickPrevious()
    }, [editor, filteredSnippetArticles, history, routes, buildUrlWithParams])

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

                const basePath = routes.knowledgeArticle(
                    nextArticle.type,
                    nextArticle.id,
                )
                const targetPath = buildUrlWithParams(basePath)
                history.replace(targetPath)
            }
        }
        editor.handleClickNext()
    }, [editor, filteredSnippetArticles, history, routes, buildUrlWithParams])

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
        handleVisibilityUpdate: editor.handleVisibilityUpdate,
    }
}
