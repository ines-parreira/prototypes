import { useCallback, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import _get from 'lodash/get'

import type { FeedbackMutation } from '@gorgias/knowledge-service-types'

import { SentryTeam } from 'common/const/sentryTeamNames'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useUpsertFeedback } from 'models/knowledgeService/mutations'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import type {
    Opportunity,
    OpportunityConfig,
    ResourceFormFields,
} from 'pages/aiAgent/opportunities/types'
import { mapGuidanceFormFieldsToGuidanceArticle } from 'pages/aiAgent/utils/guidance.utils'
import { HELP_CENTER_DEFAULT_LOCALE } from 'pages/settings/helpCenter/constants'
import {
    aiArticleKeys,
    useUpsertArticleTemplateReview,
} from 'pages/settings/helpCenter/queries'
import { FeedbackObjectType } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { getViewLanguage } from 'state/ui/helpCenter'
import { reportError } from 'utils/errors'

import {
    buildApprovePayload,
    buildDismissPayload,
    buildResolveConflictPayload,
    useProcessOpportunity,
} from './useProcessOpportunity'

interface UseOpportunityCTAsProps {
    selectedOpportunity: Opportunity | null
    editorFormResources: ResourceFormFields[]
    opportunityConfig: OpportunityConfig
}

export const useOpportunityCTAs = ({
    selectedOpportunity,
    editorFormResources,
    opportunityConfig,
}: UseOpportunityCTAsProps) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const [isProcessing, setIsProcessing] = useState(false)

    const locale = useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE

    const {
        shopIntegrationId,
        helpCenterId,
        guidanceHelpCenterId,
        useKnowledgeService,
        onArchive,
        onPublish,
        markArticleAsReviewed,
        onOpportunityAccepted,
        onOpportunityDismissed,
    } = opportunityConfig

    const { createGuidanceArticle, isGuidanceArticleUpdating } =
        useGuidanceArticleMutation({ guidanceHelpCenterId })

    const processOpportunity = useProcessOpportunity(shopIntegrationId)

    const { mutateAsync: upsertFeedback } = useUpsertFeedback({
        objectType: FeedbackObjectType.OPPORTUNITY,
        objectId: selectedOpportunity?.id || '',
        executionId: '00000000-0000-0000-0000-000000000000',
    })

    const reviewArticle = useUpsertArticleTemplateReview({
        onSuccess: async (__data, [__client, __pathParameters, body]) => {
            await queryClient.invalidateQueries({
                queryKey: aiArticleKeys.list(helpCenterId),
            })

            markArticleAsReviewed(`ai_${body.template_key}`, body.action)

            if (body.action === 'archive') {
                onArchive(`ai_${body.template_key}`)
            } else if (body.action === 'publish') {
                onPublish(`ai_${body.template_key}`)
            }
        },
        onError: async (__error, [__client, __pathParameters, __body]) => {
            await queryClient.invalidateQueries({
                queryKey: aiArticleKeys.list(helpCenterId),
            })
        },
    })

    const handleOpportunityProcessError = useCallback(
        async (error: unknown, errorMessage: string, context: string) => {
            if (!selectedOpportunity) return

            const isConflictError =
                isAxiosError(error) && _get(error, 'response.status') === 409
            if (isConflictError) {
                onArchive(selectedOpportunity.key)

                dispatch(
                    notify({
                        status: NotificationStatus.Info,
                        message:
                            'This opportunity is no longer relevant and was addressed by recent knowledge updates.',
                    }),
                )
            } else {
                dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: errorMessage,
                    }),
                )
            }

            reportError(error, {
                tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                extra: {
                    context,
                    opportunityId: selectedOpportunity?.id,
                },
            })
        },
        [dispatch, selectedOpportunity, onArchive],
    )

    const handleApprove = useCallback(async () => {
        if (!selectedOpportunity) return

        const resource = editorFormResources[0]
        if (!resource) return

        setIsProcessing(true)
        try {
            if (useKnowledgeService && shopIntegrationId) {
                await processOpportunity.mutateAsync({
                    shopIntegrationId,
                    opportunityId: parseInt(selectedOpportunity.id, 10),
                    data: buildApprovePayload({
                        isVisible: resource.isVisible,
                        title: resource.title,
                        content: resource.content,
                    }),
                })
                onArchive(selectedOpportunity.key)
            } else {
                await createGuidanceArticle(
                    mapGuidanceFormFieldsToGuidanceArticle(
                        {
                            name: resource.title,
                            content: resource.content,
                            isVisible: resource.isVisible,
                        },
                        locale,
                        selectedOpportunity.id,
                    ),
                )

                reviewArticle.mutate([
                    undefined,
                    { help_center_id: helpCenterId },
                    {
                        action: 'archive',
                        template_key: `ai_${selectedOpportunity.id}`,
                        reason: 'Created as guidance',
                    },
                ])
            }

            dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Guidance saved and enabled',
                }),
            )

            onOpportunityAccepted?.({
                opportunityId: selectedOpportunity.id,
                opportunityType: selectedOpportunity.type,
            })
        } catch (error) {
            await handleOpportunityProcessError(
                error,
                'Failed to create guidance. Please try again.',
                'Failed to approve opportunity',
            )
        } finally {
            setIsProcessing(false)
        }
    }, [
        selectedOpportunity,
        helpCenterId,
        reviewArticle,
        createGuidanceArticle,
        editorFormResources,
        locale,
        dispatch,
        onOpportunityAccepted,
        useKnowledgeService,
        processOpportunity,
        onArchive,
        shopIntegrationId,
        handleOpportunityProcessError,
    ])

    const handleResolve = useCallback(async () => {
        if (!selectedOpportunity || !shopIntegrationId) return

        setIsProcessing(true)

        try {
            const payload = buildResolveConflictPayload({
                selectedOpportunity,
                resourceUpdates: editorFormResources,
            })

            if (!payload) {
                throw new Error(
                    'Payload not valid for resolve conflict opportunity',
                )
            }

            await processOpportunity.mutateAsync({
                shopIntegrationId,
                opportunityId: parseInt(selectedOpportunity.id, 10),
                data: payload,
            })
            onArchive(selectedOpportunity.key)

            dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Conflict resolved successfully',
                }),
            )

            if ('resolutions' in payload && payload.resolutions) {
                const operations = payload.resolutions.map((resolution) => {
                    const { resourceIdentifier } = resolution
                    return {
                        action: resolution.action,
                        ...resourceIdentifier,
                    }
                })

                onOpportunityAccepted?.({
                    opportunityId: selectedOpportunity.id,
                    opportunityType: selectedOpportunity.type,
                    operations,
                })
            }
        } catch (error) {
            await handleOpportunityProcessError(
                error,
                'Failed to resolve conflict. Please try again.',
                'Failed to resolve conflict opportunity',
            )
        } finally {
            setIsProcessing(false)
        }
    }, [
        selectedOpportunity,
        dispatch,
        editorFormResources,
        processOpportunity,
        shopIntegrationId,
        onArchive,
        onOpportunityAccepted,
        handleOpportunityProcessError,
    ])

    const handleFeedback = useCallback(
        (feedbackData: { feedbackToUpsert: FeedbackMutation[] }) => {
            upsertFeedback({ data: feedbackData }).catch((error) => {
                reportError(error, {
                    tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                    extra: {
                        context:
                            'Failed to submit opportunity dismiss feedback',
                        feedbackData,
                    },
                })
            })
        },
        [upsertFeedback],
    )

    const handleDismiss = useCallback(
        async (feedbackData?: { feedbackToUpsert: FeedbackMutation[] }) => {
            if (!selectedOpportunity) return

            setIsProcessing(true)
            try {
                if (useKnowledgeService && shopIntegrationId) {
                    await processOpportunity.mutateAsync({
                        shopIntegrationId,
                        opportunityId: parseInt(selectedOpportunity.id, 10),
                        data: buildDismissPayload(),
                    })
                    onArchive(selectedOpportunity.key)
                } else {
                    reviewArticle.mutate([
                        undefined,
                        { help_center_id: helpCenterId },
                        {
                            action: 'archive',
                            template_key: `ai_${selectedOpportunity.id}`,
                            reason: 'Dismissed with feedback',
                        },
                    ])
                }

                if (feedbackData) {
                    handleFeedback(feedbackData)
                }

                dispatch(
                    notify({
                        message: 'Successfully dismissed opportunity',
                        status: NotificationStatus.Success,
                    }),
                )

                onOpportunityDismissed?.({
                    opportunityId: selectedOpportunity.id,
                    opportunityType: selectedOpportunity.type,
                })
            } catch (error) {
                await handleOpportunityProcessError(
                    error,
                    'Failed to dismiss opportunity. Please try again.',
                    'Failed to dismiss opportunity',
                )
            } finally {
                setIsProcessing(false)
            }
        },
        [
            selectedOpportunity,
            helpCenterId,
            reviewArticle,
            useKnowledgeService,
            processOpportunity,
            onArchive,
            dispatch,
            onOpportunityDismissed,
            shopIntegrationId,
            handleFeedback,
            handleOpportunityProcessError,
        ],
    )

    return {
        handleApprove,
        handleResolve,
        handleDismiss,
        isProcessing:
            isProcessing ||
            reviewArticle.isLoading ||
            isGuidanceArticleUpdating,
    }
}
