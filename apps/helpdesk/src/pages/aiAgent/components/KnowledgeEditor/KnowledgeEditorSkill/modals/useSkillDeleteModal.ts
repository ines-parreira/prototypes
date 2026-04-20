import { useCallback } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'

import { useSkillEditorStore } from '../context'
import { useSkillNotify } from '../hooks/useSkillNotify'

export const useSkillDeleteModal = () => {
    const { skillId, activeModal, isUpdating, hasBothVersions, intents } =
        useSkillEditorStore(
            useShallow((storeState) => ({
                skillId: storeState.state.skill?.id,
                activeModal: storeState.state.activeModal,
                isUpdating: storeState.state.isUpdating,
                hasBothVersions:
                    !!storeState.state.skill?.publishedVersionId &&
                    storeState.state.skill?.draftVersionId !==
                        storeState.state.skill?.publishedVersionId,
                intents: storeState.state.intents,
            })),
        )

    const { helpCenterId, onDeleteFn, onClose } = useSkillEditorStore(
        useShallow((storeState) => ({
            helpCenterId: storeState.config.helpCenter.id ?? 0,
            onDeleteFn: storeState.config.onDeleteFn,
            onClose: storeState.config.onClose,
        })),
    )

    const dispatch = useSkillEditorStore((storeState) => storeState.dispatch)
    const { success: notifySuccess, error: notifyError } = useSkillNotify()

    const { deleteGuidanceArticle } = useGuidanceArticleMutation({
        guidanceHelpCenterId: helpCenterId,
    })

    const onDelete = useCallback(async () => {
        if (!skillId) return

        dispatch({ type: 'SET_UPDATING', payload: true })
        try {
            await deleteGuidanceArticle(skillId)
            notifySuccess('Skill deleted')
            onDeleteFn?.()
        } catch {
            notifyError('An error occurred while deleting the skill.')
        } finally {
            dispatch({ type: 'SET_UPDATING', payload: false })
            dispatch({ type: 'CLOSE_MODAL' })
            onClose?.()
        }
    }, [
        deleteGuidanceArticle,
        skillId,
        onDeleteFn,
        onClose,
        dispatch,
        notifySuccess,
        notifyError,
    ])

    return {
        isOpen: activeModal === 'delete',
        isDeleting: isUpdating,
        hasBothVersions,
        intents,
        onClose: () => dispatch({ type: 'CLOSE_MODAL' }),
        onDelete,
    }
}
