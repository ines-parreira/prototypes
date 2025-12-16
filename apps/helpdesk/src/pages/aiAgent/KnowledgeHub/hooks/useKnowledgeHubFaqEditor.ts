import type { FilteredKnowledgeHubArticle } from '../types'
import { useKnowledgeHubEditor } from './useKnowledgeHubEditor'

type UseKnowledgeHubFaqEditorParams = {
    shopName: string
    filteredFaqArticles: Array<FilteredKnowledgeHubArticle>
}

export const useKnowledgeHubFaqEditor = ({
    shopName,
    filteredFaqArticles,
}: UseKnowledgeHubFaqEditorParams) => {
    const editor = useKnowledgeHubEditor({
        type: 'faq',
        shopName,
        filteredArticles: filteredFaqArticles,
    })

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
        versionStatus: editor.versionStatus,
    }
}
