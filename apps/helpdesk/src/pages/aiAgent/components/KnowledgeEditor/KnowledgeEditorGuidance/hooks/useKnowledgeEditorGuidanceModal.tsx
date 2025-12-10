import { useCallback, useState } from 'react'

import { ModalState } from '../modals/KnowledgeEditorGuidanceModal.types'
import type { KnowledgeEditorGuidanceModalState } from '../modals/KnowledgeEditorGuidanceModal.types'

export const useKnowledgeEditorGuidanceModal = () => {
    const [modalState, setModalState] =
        useState<KnowledgeEditorGuidanceModalState>({
            type: ModalState.Closed,
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
                type: ModalState.UnsavedChanges,
                onDiscard: () => {
                    setModalState({ type: ModalState.Closed })
                    onDiscardChanges()
                },
                onBackToEditing: () =>
                    setModalState({ type: ModalState.Closed }),
                onSave: async () => {
                    setModalState({ type: ModalState.Closed })
                    await onSaveChanges()
                },
            })
        },
        [],
    )

    const openDiscardDraftModal = useCallback(() => {
        setModalState({
            type: ModalState.DiscardDraft,
            onBackToEditing: () => setModalState({ type: ModalState.Closed }),
        })
    }, [])

    const closeDiscardDraftModal = useCallback(() => {
        setModalState({ type: ModalState.Closed })
    }, [])

    return {
        modal: modalState,
        openUnsavedChangesModal,
        openDiscardDraftModal,
        closeDiscardDraftModal,
    }
}
