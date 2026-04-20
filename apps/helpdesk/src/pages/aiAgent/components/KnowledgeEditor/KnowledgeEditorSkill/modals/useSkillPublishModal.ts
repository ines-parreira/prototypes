import { useCallback } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { isGorgiasApiError } from 'models/api/types'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'

import { fromArticleTranslationResponse } from '../../KnowledgeEditorGuidance/context/utils'
import { useSkillEditorStore } from '../context'
import { useSkillNotify } from '../hooks/useSkillNotify'
import { useSkillConflicts } from './useSkillConflicts'

export const useSkillPublishModal = () => {
    const {
        skillId,
        skillTemplateKey,
        activeModal,
        isUpdating,
        helpCenterId,
        helpCenterLocale,
        onUpdateFn,
        handleVisibilityUpdate,
    } = useSkillEditorStore(
        useShallow((storeState) => ({
            skillId: storeState.state.skill?.id,
            skillTemplateKey: storeState.state.skill?.templateKey ?? null,
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
        bannerType,
        skillsToDisableInfo,
        resolveAllConflicts,
        invalidateAffectedCaches,
    } = useSkillConflicts()

    const onPublish = useCallback(
        async (commitMessage: string) => {
            if (!skillId || !helpCenterLocale) return

            dispatch({ type: 'SET_UPDATING', payload: true })
            try {
                await resolveAllConflicts()

                const response = await updateGuidanceArticle(
                    {
                        isCurrent: true,
                        visibility: 'PUBLIC',
                        commitMessage: commitMessage || undefined,
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
                                templateKey: skillTemplateKey,
                            }),
                        },
                    })
                    dispatch({ type: 'SET_VISIBILITY', payload: true })
                    dispatch({ type: 'SET_MODE', payload: 'edit' })
                    notifySuccess('Skill published successfully.')
                    onUpdateFn?.()
                    handleVisibilityUpdate?.('PUBLIC')
                    invalidateAffectedCaches()
                }
            } catch (error) {
                if (isGorgiasApiError(error) && error.response.status === 409) {
                    const message = error.response.data.error.msg.replace(
                        /(\w+)::(\w+)/g,
                        (_: string, group: string, name: string) =>
                            `${group.charAt(0).toUpperCase() + group.slice(1)}/${name}`,
                    )
                    notifyError(message)
                } else {
                    notifyError('An error occurred while publishing the skill.')
                }
            } finally {
                dispatch({ type: 'SET_UPDATING', payload: false })
                dispatch({ type: 'CLOSE_MODAL' })
            }
        },
        [
            updateGuidanceArticle,
            resolveAllConflicts,
            invalidateAffectedCaches,
            skillId,
            skillTemplateKey,
            helpCenterLocale,
            dispatch,
            notifySuccess,
            notifyError,
            onUpdateFn,
            handleVisibilityUpdate,
        ],
    )

    return {
        isOpen: activeModal === 'publish',
        isPublishing: isUpdating,
        bannerType,
        skillsToDisableInfo,
        onClose: () => dispatch({ type: 'CLOSE_MODAL' }),
        onPublish,
    }
}
