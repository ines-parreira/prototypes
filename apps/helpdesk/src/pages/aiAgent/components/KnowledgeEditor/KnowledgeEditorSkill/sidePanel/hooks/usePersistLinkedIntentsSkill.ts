import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { POSITIONS } from 'reapop'
import { useShallow } from 'zustand/react/shallow'

import useAppDispatch from 'hooks/useAppDispatch'
import { helpCenterKeys } from 'models/helpCenter/queries'
import type { UpdateArticleTranslationDto } from 'models/helpCenter/types'
import { fromArticleTranslationResponse } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context/utils'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

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

    const appDispatch = useAppDispatch()

    const notifySuccess = useCallback(
        (message: string) =>
            appDispatch(
                notify({
                    message,
                    status: NotificationStatus.Success,
                    position: POSITIONS.bottomRight,
                }),
            ),
        [appDispatch],
    )

    const notifyError = useCallback(
        (message: string) =>
            appDispatch(
                notify({
                    message,
                    status: NotificationStatus.Error,
                    position: POSITIONS.bottomRight,
                }),
            ),
        [appDispatch],
    )

    const { updateGuidanceArticle } = useGuidanceArticleMutation({
        guidanceHelpCenterId: helpCenterId,
    })
    const queryClient = useQueryClient()

    const persistLinkedIntents = useCallback(
        async (
            nextLinkedIntentIds: string[],
            onSuccess: () => void,
            successMessage?: string,
        ) => {
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

                notifySuccess(successMessage ?? 'Intent successfully linked')
                onUpdateFn?.()
                onSuccess()
            } catch {
                notifyError('An error occurred while saving linked intents.')
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
            notifySuccess,
            notifyError,
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
            const message =
                nextIntentIds.length === 0
                    ? 'Intent and skill successfully disabled'
                    : 'Intent successfully disabled'

            await persistLinkedIntents(nextIntentIds, onSuccess, message)
        },
        [persistLinkedIntents],
    )

    return { persistLinkedIntents, unlinkIntent, isUpdating, isAutoSaving }
}
