import { useCallback } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { VisibilityStatusEnum } from 'models/helpCenter/types'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'

import { fromArticleTranslationResponse } from '../../KnowledgeEditorGuidance/context/utils'
import { useSkillEditorStore } from '../context'
import { useSkillNotify } from '../hooks/useSkillNotify'
import { useSkillConflicts } from './useSkillConflicts'
import { getSkillEnableErrorMessage } from './useSkillEnableModal.utils'

export const useSkillEnableModal = () => {
    const {
        skillId,
        skillTitle,
        isFirstTimeEnable,
        activeModal,
        isUpdating,
        helpCenterId,
        helpCenterLocale,
        onUpdateFn,
        handleVisibilityUpdate,
    } = useSkillEditorStore(
        useShallow((storeState) => ({
            skillId: storeState.state.skill?.id,
            skillTitle: storeState.state.title,
            isFirstTimeEnable:
                storeState.state.skill?.publishedVersionId == null,
            activeModal: storeState.state.activeModal,
            isUpdating: storeState.state.isUpdating,
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

    const {
        hasConflicts,
        bannerType,
        skillsToDisableInfo,
        resolveAllConflicts,
        invalidateAffectedCaches,
    } = useSkillConflicts()

    const enableSkill = useCallback(async () => {
        if (!skillId || !helpCenterLocale) return

        dispatch({ type: 'SET_UPDATING', payload: true })
        try {
            await resolveAllConflicts()

            const response = await updateGuidanceArticle(
                {
                    isCurrent: true,
                    visibility: VisibilityStatusEnum.PUBLIC,
                },
                {
                    articleId: skillId,
                    locale: helpCenterLocale,
                },
            )

            if (response) {
                dispatch({
                    type: 'MARK_AS_SAVED',
                    payload: {
                        title: response.title,
                        content: response.content,
                        article: fromArticleTranslationResponse(response, {
                            id: skillId,
                        }),
                    },
                })
            }

            dispatch({ type: 'SET_VISIBILITY', payload: true })
            dispatch({ type: 'SET_MODE', payload: 'edit' })
            notifySuccess('Skill enabled')
            onUpdateFn?.()
            handleVisibilityUpdate?.(VisibilityStatusEnum.PUBLIC)
            invalidateAffectedCaches()
        } catch (error) {
            notifyError(getSkillEnableErrorMessage(error, skillTitle))
        } finally {
            dispatch({ type: 'SET_UPDATING', payload: false })
            dispatch({ type: 'CLOSE_MODAL' })
        }
    }, [
        skillId,
        skillTitle,
        helpCenterLocale,
        updateGuidanceArticle,
        resolveAllConflicts,
        invalidateAffectedCaches,
        dispatch,
        notifySuccess,
        notifyError,
        onUpdateFn,
        handleVisibilityUpdate,
    ])

    const requestEnable = useCallback(() => {
        if (hasConflicts) {
            dispatch({ type: 'SET_MODAL', payload: 'enable' })
            return
        }
        enableSkill()
    }, [hasConflicts, dispatch, enableSkill])

    return {
        isOpen: activeModal === 'enable' && hasConflicts,
        isEnabling: isUpdating,
        bannerType,
        skillsToDisableInfo,
        isFirstTimeEnable,
        onClose: () => dispatch({ type: 'CLOSE_MODAL' }),
        onEnable: enableSkill,
        requestEnable,
    }
}
