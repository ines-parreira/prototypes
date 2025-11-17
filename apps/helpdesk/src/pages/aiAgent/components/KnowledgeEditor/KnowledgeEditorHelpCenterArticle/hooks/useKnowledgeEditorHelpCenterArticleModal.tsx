import { useCallback, useState } from 'react'

import type { OptionItem } from 'pages/settings/helpCenter/components/articles/ArticleLanguageSelect'

export type Resource =
    | {
          kind: 'article'
      }
    | {
          kind: 'article-translation'
          locale: OptionItem
      }

export type KnowledgeEditorHelpCenterArticleModalState =
    | {
          type: 'closed'
      }
    | {
          type: 'unsaved-changes'
          onDiscard: () => void
          onClose: () => void
          onSave: () => Promise<void>
      }
    | {
          type: 'confirm-delete'
          resource: Resource
          onClose: () => void
          onConfirm: () => Promise<void>
      }

export const useKnowledgeEditorHelpCenterArticleModal = () => {
    const [modalState, setModalState] =
        useState<KnowledgeEditorHelpCenterArticleModalState>({
            type: 'closed',
        })

    const openUnsavedChangesModal = useCallback(
        ({
            onDiscardChanges,
            onSaveChanges,
        }: {
            onDiscardChanges: () => void
            onSaveChanges: () => Promise<void>
        }) => {
            setModalState({
                type: 'unsaved-changes',
                onDiscard: () => {
                    setModalState({ type: 'closed' })
                    onDiscardChanges()
                },
                onClose: () => setModalState({ type: 'closed' }),
                onSave: async () => {
                    setModalState({ type: 'closed' })
                    await onSaveChanges()
                },
            })
        },
        [],
    )

    const openConfirmDeleteModal = useCallback(
        ({
            resource,
            onConfirm,
        }: {
            resource: Resource
            onConfirm: () => Promise<void>
        }) => {
            setModalState({
                type: 'confirm-delete',
                resource,
                onClose: () => setModalState({ type: 'closed' }),
                onConfirm: async () => {
                    setModalState({ type: 'closed' })
                    await onConfirm()
                },
            })
        },
        [],
    )

    return {
        modal: modalState,
        openUnsavedChangesModal,
        openConfirmDeleteModal,
    }
}
