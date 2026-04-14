import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { POSITIONS } from 'reapop'
import { useShallow } from 'zustand/react/shallow'

import useAppDispatch from 'hooks/useAppDispatch'
import { helpCenterKeys } from 'models/helpCenter/queries'
import { fromArticleTranslationResponse } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context'
import { useSkillEditorStore } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/context/KnowledgeEditorSkillContext'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useSkillSupportingKnowledgeFromContext = () => {
    const {
        skillId,
        skillLocale,
        skillTemplateKey,
        helpCenterId,
        isCurrent,
        hasPublishedVersion,
        isUpdating,
        isAutoSaving,
        useSupportingContent,
        mode,
        historicalVersionUseSupportingContent,
        historicalPublishedDatetime,
        comparisonVersionUseSupportingContent,
        onUpdateFn,
        dispatch,
    } = useSkillEditorStore(
        useShallow((storeState) => ({
            skillId: storeState.state.skill?.id,
            skillLocale: storeState.state.skill?.locale,
            skillTemplateKey: storeState.state.skill?.templateKey,
            helpCenterId: storeState.config.helpCenter?.id ?? 0,
            isCurrent: storeState.state.skill?.isCurrent,
            hasPublishedVersion: !!storeState.state.skill?.publishedVersionId,
            isUpdating: storeState.state.isUpdating,
            isAutoSaving: storeState.state.isAutoSaving,
            useSupportingContent: storeState.state.useSupportingContent,
            mode: storeState.state.mode,
            historicalVersionUseSupportingContent:
                storeState.state.historicalVersion?.useSupportingContent,
            historicalPublishedDatetime:
                storeState.state.historicalVersion?.publishedDatetime,
            comparisonVersionUseSupportingContent:
                storeState.state.comparisonVersion?.useSupportingContent,
            onUpdateFn: storeState.config.onUpdateFn,
            dispatch: storeState.dispatch,
        })),
    )

    const isDiffMode = mode === 'diff'
    const isViewingHistoricalVersion =
        historicalPublishedDatetime !== null &&
        historicalPublishedDatetime !== undefined

    const appDispatch = useAppDispatch()

    const { updateGuidanceArticle } = useGuidanceArticleMutation({
        guidanceHelpCenterId: helpCenterId,
    })

    const queryClient = useQueryClient()

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

    const updateUseSupportingKnowledge = useCallback(
        async (useSupportingKnowledge: boolean, onSuccess: () => void) => {
            if (!skillId || !skillLocale || isUpdating || isAutoSaving) {
                return
            }

            dispatch({ type: 'SET_UPDATING', payload: true })
            try {
                const response = await updateGuidanceArticle(
                    {
                        useSupportingContent: useSupportingKnowledge,
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
            notifyError,
        ],
    )

    const displayedUseSupportingKnowledge = (() => {
        if (isDiffMode && comparisonVersionUseSupportingContent !== undefined) {
            return comparisonVersionUseSupportingContent ?? true
        }
        if (isViewingHistoricalVersion) {
            return historicalVersionUseSupportingContent ?? true
        }
        return useSupportingContent
    })()

    return {
        skillId,
        useSupportingKnowledge: displayedUseSupportingKnowledge,
        isDiffMode,
        isViewingHistoricalVersion,
        updateUseSupportingKnowledge,
        isCurrent,
        hasPublishedVersion,
        isUpdating,
        isAutoSaving,
    }
}
