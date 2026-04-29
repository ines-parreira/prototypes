import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'

import { toast } from '@gorgias/axiom'

import { helpCenterKeys } from 'models/helpCenter/queries'
import type { UpdateArticleTranslationDto } from 'models/helpCenter/types'
import { fromArticleTranslationResponse } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context/utils'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'

import { useSkillEditorStore } from '../../context/KnowledgeEditorSkillContext'

export const usePersistLinkedIntentsSkill = () => {
    const {
        skillId,
        skillLocale,
        skillTemplateKey,
        helpCenterId,
        isUpdating,
        isAutoSaving,
        onUpdateFn,
        dispatch,
    } = useSkillEditorStore(
        useShallow((storeState) => ({
            skillId: storeState.state.skill?.id,
            skillLocale: storeState.state.skill?.locale,
            skillTemplateKey: storeState.state.skill?.templateKey,
            helpCenterId: storeState.config.helpCenter?.id ?? 0,
            isUpdating: storeState.state.isUpdating,
            isAutoSaving: storeState.state.isAutoSaving,
            onUpdateFn: storeState.config.onUpdateFn,
            dispatch: storeState.dispatch,
        })),
    )

    const { updateGuidanceArticle } = useGuidanceArticleMutation({
        guidanceHelpCenterId: helpCenterId,
    })
    const queryClient = useQueryClient()

    const persistLinkedIntents = useCallback(
        async (nextLinkedIntentIds: string[], onSuccess: () => void) => {
            if (!skillId || !skillLocale || isUpdating || isAutoSaving) {
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
                        articleId: skillId,
                        locale: skillLocale,
                    },
                )

                if (!response) {
                    return
                }

                dispatch({
                    type: 'MARK_AS_SAVED',
                    payload: {
                        article: fromArticleTranslationResponse(response, {
                            id: skillId,
                            templateKey: skillTemplateKey,
                        }),
                    },
                })

                await queryClient.invalidateQueries({
                    queryKey: helpCenterKeys.intents(helpCenterId),
                })

                onUpdateFn?.()
                onSuccess()
            } catch {
                toast.error('An error occurred while saving linked intents.')
            } finally {
                dispatch({ type: 'SET_UPDATING', payload: false })
            }
        },
        [
            skillId,
            skillLocale,
            skillTemplateKey,
            helpCenterId,
            isUpdating,
            isAutoSaving,
            dispatch,
            updateGuidanceArticle,
            queryClient,
            onUpdateFn,
        ],
    )

    const unlinkIntent = useCallback(
        async (
            intentIdToRemove: string,
            currentIntentIds: string[],
            onSuccess: () => void,
        ) => {
            const nextIntentIds = currentIntentIds.filter(
                (id) => id !== intentIdToRemove,
            )

            await persistLinkedIntents(nextIntentIds, onSuccess)
        },
        [persistLinkedIntents],
    )

    return { persistLinkedIntents, unlinkIntent, isUpdating, isAutoSaving }
}
