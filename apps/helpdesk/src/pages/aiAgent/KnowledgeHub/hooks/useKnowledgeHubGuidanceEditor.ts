import { useKnowledgeHubEditor } from './useKnowledgeHubEditor'

type UseKnowledgeHubGuidanceEditorParams = {
    shopName: string
    shopType: string
    filteredGuidanceArticles: Array<{ id: number; title: string }>
}

export const useKnowledgeHubGuidanceEditor = ({
    shopName,
    shopType,
    filteredGuidanceArticles,
}: UseKnowledgeHubGuidanceEditorParams) => {
    const editor = useKnowledgeHubEditor({
        type: 'guidance',
        shopName,
        shopType,
        filteredArticles: filteredGuidanceArticles,
    })

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
        onClickPrevious: editor.handleClickPrevious,
        onClickNext: editor.handleClickNext,
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
