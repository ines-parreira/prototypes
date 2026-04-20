import { useCallback } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { VisibilityStatusEnum } from 'models/helpCenter/types'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'

import { useSkillEditorStore } from '../context'
import { useSkillNotify } from '../hooks/useSkillNotify'

export const useSkillDisableModal = () => {
    const { skillId, activeModal, isUpdating } = useSkillEditorStore(
        useShallow((storeState) => ({
            skillId: storeState.state.skill?.id,
            activeModal: storeState.state.activeModal,
            isUpdating: storeState.state.isUpdating,
        })),
    )

    const {
        helpCenterId,
        helpCenterLocale,
        onUpdateFn,
        handleVisibilityUpdate,
    } = useSkillEditorStore(
        useShallow((storeState) => ({
            helpCenterId: storeState.config.helpCenter.id ?? 0,
            helpCenterLocale:
                storeState.config.helpCenter.default_locale ?? 'en-US',
            onUpdateFn: storeState.config.onUpdateFn,
            handleVisibilityUpdate: storeState.config.handleVisibilityUpdate,
        })),
    )

    const dispatch = useSkillEditorStore((storeState) => storeState.dispatch)
    const { success: notifySuccess, error: notifyError } = useSkillNotify()

    const { updateGuidanceArticle } = useGuidanceArticleMutation({
        guidanceHelpCenterId: helpCenterId,
    })

    const onDisable = useCallback(async () => {
        if (!skillId) return

        dispatch({ type: 'SET_UPDATING', payload: true })
        try {
            const response = await updateGuidanceArticle(
                {
                    visibility: VisibilityStatusEnum.UNLISTED,
                    isCurrent: false,
                },
                {
                    articleId: skillId,
                    locale: helpCenterLocale,
                },
            )

            if (response) {
                dispatch({ type: 'SET_VISIBILITY', payload: false })
                notifySuccess('Skill disabled')
                onUpdateFn?.()
                handleVisibilityUpdate?.(VisibilityStatusEnum.UNLISTED)
            }
        } catch {
            notifyError('An error occurred while disabling the skill.')
        } finally {
            dispatch({ type: 'SET_UPDATING', payload: false })
            dispatch({ type: 'CLOSE_MODAL' })
        }
    }, [
        updateGuidanceArticle,
        skillId,
        helpCenterLocale,
        dispatch,
        onUpdateFn,
        handleVisibilityUpdate,
        notifySuccess,
        notifyError,
    ])

    return {
        isOpen: activeModal === 'disable',
        isDisabling: isUpdating,
        onClose: () => dispatch({ type: 'CLOSE_MODAL' }),
        onDisable,
    }
}
