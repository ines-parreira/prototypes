import { useMemo } from 'react'

import type { ArticleMode } from '../../KnowledgeEditorTopBar/KnowledgeEditorTopBarHelpCenterArticlesControls'
import { ArticleModes } from '../../KnowledgeEditorTopBar/KnowledgeEditorTopBarHelpCenterArticlesControls'

type Props = {
    mode: ArticleModes
    onEdit: () => void
    onCancel: () => void
    onSaveAndPublish: () => Promise<void>
    onSaveDraft: () => Promise<void>
    onDelete: () => Promise<void>
    onTest: () => void
}

export const useKnowledgeEditorHelpCenterArticleMode = ({
    mode,
    onEdit,
    onCancel,
    onSaveAndPublish,
    onSaveDraft,
    onDelete,
    onTest,
}: Props): ArticleMode => {
    return useMemo(
        (): ArticleMode =>
            mode === ArticleModes.READ
                ? {
                      mode: ArticleModes.READ,
                      onEdit,
                      onDelete,
                      onTest,
                  }
                : mode === ArticleModes.EDIT_PUBLISHED
                  ? {
                        mode: ArticleModes.EDIT_PUBLISHED,
                        onSaveAndPublish: onSaveAndPublish,
                        onCancel,
                    }
                  : {
                        mode: ArticleModes.EDIT_DRAFT,
                        onSaveDraft,
                        onSaveAndPublish,
                        onCancel,
                    },
        [
            onEdit,
            onSaveDraft,
            onSaveAndPublish,
            onCancel,
            onDelete,
            onTest,
            mode,
        ],
    )
}
