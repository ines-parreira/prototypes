import { useMemo } from 'react'

import {
    ArticleMode,
    ArticleModes,
} from '../../KnowledgeEditorTopBar/KnowledgeEditorTopBarHelpCenterArticlesControls'

type Props = {
    mode: ArticleModes
    onEdit: () => void
    onCancel: () => void
    onSave: () => Promise<void>
    onDelete: () => Promise<void>
}

export const useKnowledgeEditorHelpCenterArticleMode = ({
    mode,
    onEdit,
    onCancel,
    onSave,
    onDelete,
}: Props): ArticleMode => {
    return useMemo(
        () =>
            mode === ArticleModes.READ
                ? {
                      mode: ArticleModes.READ,
                      onEdit,
                      onDelete,
                      onTest: () => {},
                  }
                : mode === ArticleModes.EDIT_PUBLISHED
                  ? {
                        mode: ArticleModes.EDIT_PUBLISHED,
                        onSaveAndPublish: onSave,
                        onCancel: onCancel,
                    }
                  : {
                        mode: ArticleModes.EDIT_DRAFT,
                        onCreate: onSave,
                        onCancel: onCancel,
                    },
        [onEdit, onSave, onCancel, onDelete, mode],
    )
}
