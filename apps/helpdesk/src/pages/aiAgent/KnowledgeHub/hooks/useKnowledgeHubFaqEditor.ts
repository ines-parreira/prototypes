import { useCallback } from 'react'

import { useHistory, useLocation } from 'react-router-dom'

import { updateArticleIdInUrl } from './navigationUtils'
import { useKnowledgeHubEditor } from './useKnowledgeHubEditor'

type UseKnowledgeHubFaqEditorParams = {
    shopName: string
    filteredFaqArticles: Array<{ id: number; title: string }>
}

export const useKnowledgeHubFaqEditor = ({
    shopName,
    filteredFaqArticles,
}: UseKnowledgeHubFaqEditorParams) => {
    const history = useHistory()
    const location = useLocation()

    const editor = useKnowledgeHubEditor({
        type: 'faq',
        shopName,
        filteredArticles: filteredFaqArticles,
    })

    const handleClickPrevious = useCallback(() => {
        if (editor.hasPrevious && filteredFaqArticles.length > 0) {
            const currentIndex = filteredFaqArticles.findIndex(
                (article) => article.id === editor.currentArticleId,
            )
            if (currentIndex > 0) {
                const previousArticle = filteredFaqArticles[currentIndex - 1]
                updateArticleIdInUrl(
                    location,
                    history,
                    'faq',
                    previousArticle.id,
                )
            }
        }
        editor.handleClickPrevious()
    }, [editor, filteredFaqArticles, history, location])

    const handleClickNext = useCallback(() => {
        if (editor.hasNext && filteredFaqArticles.length > 0) {
            const currentIndex = filteredFaqArticles.findIndex(
                (article) => article.id === editor.currentArticleId,
            )
            if (
                currentIndex >= 0 &&
                currentIndex < filteredFaqArticles.length - 1
            ) {
                const nextArticle = filteredFaqArticles[currentIndex + 1]
                updateArticleIdInUrl(location, history, 'faq', nextArticle.id)
            }
        }
        editor.handleClickNext()
    }, [editor, filteredFaqArticles, history, location])

    return {
        isEditorOpen: editor.isEditorOpen,
        currentArticleId: editor.currentArticleId,
        faqArticleMode: editor.faqArticleMode,
        initialArticleMode: editor.initialArticleMode,
        openEditorForCreate: editor.openEditorForCreate,
        openEditorForEdit: editor.openEditorForEdit,
        closeEditor: editor.closeEditor,
        handleCreate: editor.handleCreate,
        handleUpdate: editor.handleUpdate,
        handleDelete: editor.handleDelete,
        hasPrevious: editor.hasPrevious,
        hasNext: editor.hasNext,
        handleClickPrevious,
        handleClickNext,
    }
}
