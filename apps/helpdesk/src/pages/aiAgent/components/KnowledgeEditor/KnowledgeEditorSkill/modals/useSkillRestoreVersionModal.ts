import { useCallback } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'

import { fromArticleTranslationResponse } from '../../KnowledgeEditorGuidance/context/utils'
import { useVersionHistoryTracking } from '../../shared/useVersionHistoryTracking/useVersionHistoryTracking'
import { useSkillEditorStore } from '../context'
import { useSkillNotify } from '../hooks/useSkillNotify'

export const useSkillRestoreVersionModal = () => {
    const {
        skillId,
        skillTemplateKey,
        activeModal,
        isUpdating,
        historicalVersion,
    } = useSkillEditorStore(
        useShallow((storeState) => ({
            skillId: storeState.state.skill?.id,
            skillTemplateKey: storeState.state.skill?.templateKey ?? null,
            activeModal: storeState.state.activeModal,
            isUpdating: storeState.state.isUpdating,
            historicalVersion: storeState.state.historicalVersion,
        })),
    )

    const { shopName, helpCenterId, helpCenterLocale, onUpdateFn } =
        useSkillEditorStore(
            useShallow((storeState) => ({
                shopName: storeState.config.shopName,
                helpCenterId: storeState.config.helpCenter.id ?? 0,
                helpCenterLocale:
                    storeState.config.helpCenter.default_locale ?? 'en-US',
                onUpdateFn: storeState.config.onUpdateFn,
            })),
        )

    const dispatch = useSkillEditorStore((storeState) => storeState.dispatch)
    const { error: notifyError, success: notifySuccess } = useSkillNotify()

    const { onVersionRestored } = useVersionHistoryTracking({
        shopName,
        resourceType: 'guidance',
        resourceId: skillId ?? 0,
        helpCenterId,
        locale: helpCenterLocale,
    })

    const { updateGuidanceArticle } = useGuidanceArticleMutation({
        guidanceHelpCenterId: helpCenterId,
    })

    const onRestore = useCallback(async () => {
        if (!skillId || !helpCenterLocale || !historicalVersion) {
            return
        }

        dispatch({ type: 'SET_UPDATING', payload: true })
        try {
            const response = await updateGuidanceArticle(
                {
                    isCurrent: false,
                    title: historicalVersion.title,
                    content: historicalVersion.content,
                    intents: historicalVersion.intents,
                    useSupportingContent:
                        historicalVersion.useSupportingContent,
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
                dispatch({ type: 'CLEAR_HISTORICAL_VERSION' })
                dispatch({ type: 'SET_MODE', payload: 'edit' })
                notifySuccess('Version restored as draft.')
                onVersionRestored({
                    versionId: historicalVersion.versionId,
                    versionNumber: historicalVersion.version,
                    publishedDatetime: historicalVersion.publishedDatetime,
                })
                onUpdateFn?.()
            }
        } catch {
            notifyError('An error occurred while restoring version.')
        } finally {
            dispatch({ type: 'SET_UPDATING', payload: false })
            dispatch({ type: 'CLOSE_MODAL' })
        }
    }, [
        updateGuidanceArticle,
        skillId,
        skillTemplateKey,
        helpCenterLocale,
        historicalVersion,
        dispatch,
        notifySuccess,
        notifyError,
        onVersionRestored,
        onUpdateFn,
    ])

    return {
        isOpen: activeModal === 'restore',
        isRestoring: isUpdating,
        onClose: () => dispatch({ type: 'CLOSE_MODAL' }),
        onRestore,
    }
}
