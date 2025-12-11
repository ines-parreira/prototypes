import { useCallback } from 'react'

import { useHistory, useLocation } from 'react-router-dom'

import type { FilteredKnowledgeHubArticle } from '../types'
import { updateArticleIdInUrl } from './navigationUtils'
import { useKnowledgeHubEditor } from './useKnowledgeHubEditor'

type UseKnowledgeHubGuidanceEditorParams = {
    shopName: string
    shopType: string
    filteredGuidanceArticles: Array<FilteredKnowledgeHubArticle>
}

export const useKnowledgeHubGuidanceEditor = ({
    shopName,
    shopType,
    filteredGuidanceArticles,
}: UseKnowledgeHubGuidanceEditorParams) => {
    const history = useHistory()
    const location = useLocation()

    const editor = useKnowledgeHubEditor({
        type: 'guidance',
        shopName,
        shopType,
        filteredArticles: filteredGuidanceArticles,
    })

    const handleClickPrevious = useCallback(() => {
        if (editor.hasPrevious && filteredGuidanceArticles.length > 0) {
            const currentIndex = filteredGuidanceArticles.findIndex(
                (article) => article.id === editor.currentArticleId,
            )
            if (currentIndex > 0) {
                const previousArticle =
                    filteredGuidanceArticles[currentIndex - 1]
                updateArticleIdInUrl(
                    location,
                    history,
                    'guidance',
                    previousArticle.id,
                )
            }
        }
        editor.handleClickPrevious()
    }, [editor, filteredGuidanceArticles, history, location])

    const handleClickNext = useCallback(() => {
        if (editor.hasNext && filteredGuidanceArticles.length > 0) {
            const currentIndex = filteredGuidanceArticles.findIndex(
                (article) => article.id === editor.currentArticleId,
            )
            if (
                currentIndex >= 0 &&
                currentIndex < filteredGuidanceArticles.length - 1
            ) {
                const nextArticle = filteredGuidanceArticles[currentIndex + 1]
                updateArticleIdInUrl(
                    location,
                    history,
                    'guidance',
                    nextArticle.id,
                )
            }
        }
        editor.handleClickNext()
    }, [editor, filteredGuidanceArticles, history, location])

    const knowledgeEditorProps = {
        shopName: editor.shopName,
        shopType: editor.shopType,
        guidanceArticleId: editor.currentArticleId,
        guidanceTemplate: editor.guidanceTemplate,
        guidanceMode: editor.guidanceMode,
        isOpen: editor.isEditorOpen,
        onClose: editor.closeEditor,
        onCreate: editor.handleCreate,
        onUpdate: editor.handleUpdate,
        onDelete: editor.handleDelete,
        onClickPrevious: handleClickPrevious,
        onClickNext: handleClickNext,
    }

    return {
        isEditorOpen: editor.isEditorOpen,
        currentGuidanceArticleId: editor.currentArticleId,
        guidanceMode: editor.guidanceMode,
        openEditorForCreate: editor.openEditorForCreate,
        openEditorForEdit: editor.openEditorForEdit,
        closeEditor: editor.closeEditor,
        knowledgeEditorProps,
    }
}
