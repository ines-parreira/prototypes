import { useCallback, useState } from 'react'

import { reportError } from '@repo/logging'
import { isAxiosError } from 'axios'
import { toast } from '@gorgias/axiom'
import type { FeedbackMutation } from '@gorgias/knowledge-service-types'
import { get } from '@gorgias/toolkit'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useUpsertFeedback } from 'models/knowledgeService/mutations'
import type {
    Opportunity,
    OpportunityConfig,
    ResourceFormFields,
} from 'pages/aiAgent/opportunities/types'
import {
    FeedbackObjectType,
    FeedbackTargetType,
    OpportunityFeedbackType,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

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
    const [isProcessing, setIsProcessing] = useState(false)

    const {
        shopIntegrationId,
        useKnowledgeService,
        onArchive,
        onOpportunityAccepted,
        onOpportunityDismissed,
    } = opportunityConfig

    const processOpportunity = useProcessOpportunity(shopIntegrationId)

    const { mutateAsync: upsertFeedback } = useUpsertFeedback({
        objectType: FeedbackObjectType.OPPORTUNITY,
        objectId: selectedOpportunity?.id || '',
        executionId: '00000000-0000-0000-0000-000000000000',
    })

    const handleOpportunityProcessError = useCallback(
        async (error: unknown, errorMessage: string, context: string) => {
            if (!selectedOpportunity) return

            const isConflictError =
                isAxiosError(error) && get(error, 'response.status') === 409
            if (isConflictError) {
                onArchive(selectedOpportunity.key)

                toast.info(
                    'This opportunity is no longer relevant and was addressed by recent knowledge updates.',
                )
            } else {
                toast.error(errorMessage)
            }

            reportError(error, {
                tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                extra: {
                    context,
                    opportunityId: selectedOpportunity?.id,
                },
            })
        },
        [selectedOpportunity, onArchive],
    )

    const handleFeedback = useCallback(
        (feedbackData: { feedbackToUpsert: FeedbackMutation[] }) => {
            upsertFeedback({ data: feedbackData }).catch((error) => {
                reportError(error, {
                    tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                    extra: {
                        context: 'Failed to submit opportunity feedback',
                        feedbackData,
                    },
                })
            })
        },
        [upsertFeedback],
    )

    const buildAcknowledgeFeedback = useCallback(
        (opportunityId: string): FeedbackMutation[] => {
            return [
                {
                    objectType: FeedbackObjectType.OPPORTUNITY,
                    objectId: opportunityId,
                    executionId: '00000000-0000-0000-0000-000000000000',
                    targetType: FeedbackTargetType.OPPORTUNITY,
                    targetId: opportunityId,
                    feedbackType: OpportunityFeedbackType.OPPORTUNITY_FREEFORM,
                    feedbackValue:
                        'Knowledge gap opportunity was resolved by the merchant',
                },
            ]
        },
        [],
    )

    const handleApprove = useCallback(async () => {
        if (!selectedOpportunity || !useKnowledgeService || !shopIntegrationId)
            return

        const resource = editorFormResources[0]
        if (!resource) return

        setIsProcessing(true)
        try {
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

            const feedback = buildAcknowledgeFeedback(selectedOpportunity.id)
            handleFeedback({ feedbackToUpsert: feedback })

            toast.success('Knowledge gap resolved')

            onOpportunityAccepted?.({
                opportunityId: selectedOpportunity.id,
                opportunityType: selectedOpportunity.type,
            })
        } catch (error) {
            await handleOpportunityProcessError(
                error,
                'Failed to resolve knowledge gap. Please try again.',
                'Failed to resolve knowledge gap',
            )
        } finally {
            setIsProcessing(false)
        }
    }, [
        selectedOpportunity,
        editorFormResources,
        onOpportunityAccepted,
        useKnowledgeService,
        processOpportunity,
        onArchive,
        shopIntegrationId,
        handleOpportunityProcessError,
        handleFeedback,
        buildAcknowledgeFeedback,
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

            toast.success('Conflict resolved successfully')

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
        editorFormResources,
        processOpportunity,
        shopIntegrationId,
        onArchive,
        onOpportunityAccepted,
        handleOpportunityProcessError,
    ])

    const handleDismiss = useCallback(
        async (feedbackData?: { feedbackToUpsert: FeedbackMutation[] }) => {
            if (
                !selectedOpportunity ||
                !useKnowledgeService ||
                !shopIntegrationId
            )
                return

            setIsProcessing(true)
            try {
                await processOpportunity.mutateAsync({
                    shopIntegrationId,
                    opportunityId: parseInt(selectedOpportunity.id, 10),
                    data: buildDismissPayload(),
                })
                onArchive(selectedOpportunity.key)

                if (feedbackData) {
                    handleFeedback(feedbackData)
                }

                toast.success('Successfully dismissed opportunity')

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
            useKnowledgeService,
            processOpportunity,
            onArchive,
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
        isProcessing,
    }
}
