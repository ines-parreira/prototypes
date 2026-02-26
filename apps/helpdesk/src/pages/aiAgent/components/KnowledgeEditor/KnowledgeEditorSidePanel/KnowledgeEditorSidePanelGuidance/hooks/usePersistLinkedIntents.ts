import { useCallback } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { useNotify } from 'hooks/useNotify'
import type { UpdateArticleTranslationDto } from 'models/helpCenter/types'
import { useGuidanceStore } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context'
import { fromArticleTranslationResponse } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context/utils'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'

export const usePersistLinkedIntents = () => {
    const {
        guidanceId,
        guidanceLocale,
        guidanceTemplateKey,
        guidanceHelpCenterId,
        isUpdating,
        isAutoSaving,
        onUpdateFn,
        dispatch,
    } = useGuidanceStore(
        useShallow((storeState) => ({
            guidanceId: storeState.state.guidance?.id,
            guidanceLocale: storeState.state.guidance?.locale,
            guidanceTemplateKey: storeState.state.guidance?.templateKey,
            guidanceHelpCenterId: storeState.config.guidanceHelpCenter?.id ?? 0,
            isUpdating: storeState.state.isUpdating,
            isAutoSaving: storeState.state.isAutoSaving,
            onUpdateFn: storeState.config.onUpdateFn,
            dispatch: storeState.dispatch,
        })),
    )

    const { error: notifyError } = useNotify()
    const { updateGuidanceArticle } = useGuidanceArticleMutation({
        guidanceHelpCenterId,
    })

    const persistLinkedIntents = useCallback(
        async (nextLinkedIntentIds: string[], onSuccess: () => void) => {
            if (!guidanceId || !guidanceLocale || isUpdating || isAutoSaving) {
                return
            }

            dispatch({ type: 'SET_UPDATING', payload: true })
            try {
                const response = await updateGuidanceArticle(
                    {
                        intents: nextLinkedIntentIds as NonNullable<
                            UpdateArticleTranslationDto['intents']
                        >,
                        isCurrent: false,
                    },
                    {
                        articleId: guidanceId,
                        locale: guidanceLocale,
                    },
                )

                if (!response) {
                    return
                }

                dispatch({
                    type: 'MARK_AS_SAVED',
                    payload: {
                        guidance: fromArticleTranslationResponse(response, {
                            id: guidanceId,
                            templateKey: guidanceTemplateKey,
                        }),
                    },
                })
                onUpdateFn?.()
                onSuccess()
            } catch {
                notifyError('An error occurred while saving linked intents.')
            } finally {
                dispatch({ type: 'SET_UPDATING', payload: false })
            }
        },
        [
            guidanceId,
            guidanceLocale,
            guidanceTemplateKey,
            isUpdating,
            isAutoSaving,
            dispatch,
            updateGuidanceArticle,
            onUpdateFn,
            notifyError,
        ],
    )

    return { persistLinkedIntents, isUpdating, isAutoSaving }
}
