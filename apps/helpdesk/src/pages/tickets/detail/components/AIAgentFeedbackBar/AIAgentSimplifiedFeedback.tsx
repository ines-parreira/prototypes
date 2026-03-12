import { useCallback, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { TicketInfobarTab } from '@repo/navigation'
import { v4 as uuidv4 } from 'uuid'

import { LegacyButton as Button, Separator } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { useUpsertFeedback } from 'models/knowledgeService/mutations'
import { useGetFeedback } from 'models/knowledgeService/queries'
import { useShopIntegrationId } from 'pages/aiAgent/hooks/useShopIntegrationId'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import { DetectedOpportunitiesBanner } from 'pages/aiAgent/opportunities/components/DetectedOpportunitiesBanner/DetectedOpportunitiesBanner'
import { useHasAccessToOpportunities } from 'pages/aiAgent/opportunities/hooks/useHasAccessToOpportunities'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentSimplifiedFeedback.less'
import AutoSaveBadge from 'pages/tickets/detail/components/AIAgentFeedbackBar/AutoSaveBadge'
import CreateKnowledgeSection from 'pages/tickets/detail/components/AIAgentFeedbackBar/CreateKnowledgeSection'
import { useFeedbackActions } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useFeedbackActions'
import { useFeedbackTracking } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useFeedbackTracking'
import KnowledgeSourceFeedback from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceFeedback'
import { KnowledgeSourceFeedbackSkeleton } from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceFeedbackSkeleton'
import MissingKnowledgeSelect from 'pages/tickets/detail/components/AIAgentFeedbackBar/MissingKnowledgeSelect'
import type {
    AiAgentBinaryFeedbackEnum,
    KnowledgeResource,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import {
    AiAgentFeedbackTypeEnum,
    AiAgentKnowledgeResourceTypeEnum,
    AutoSaveState,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import useGoToNextTicket from 'pages/tickets/detail/components/TicketNavigation/hooks/useGoToNextTicket'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getSectionIdByName } from 'state/entities/sections/selectors'
import { getAIAgentMessages, getTicketState } from 'state/ticket/selectors'
import { getViewsState } from 'state/views/selectors'

import { AIAgentTicketLevelFeedback } from './AIAgentTicketLevelFeedback/AIAgentTicketLevelFeedback'
import { useEnrichFeedbackData } from './useEnrichKnowledgeFeedbackData/useEnrichFeedbackData'
import { useGetAllRelatedResourceData } from './useEnrichKnowledgeFeedbackData/useGetAllRelatedResourceData'
import { knowledgeResourceOrder } from './useEnrichKnowledgeFeedbackData/utils'

// If there are no executions from knowledge-service after this time since last AI message, we show only the Ticket Rating
const TIME_UNTIL_SHOWING_TICKET_LEVEL_FEEDBACK = 2 * 60 * 60 * 1000 // 2 hours

const AIAgentSimplifiedFeedback = () => {
    const [loadingMutations, setLoadingMutations] = useState<string[]>()
    const viewsState = useAppSelector(getViewsState)
    const existingSections = useAppSelector(getSectionIdByName)

    const showNextTicketButton =
        viewsState.getIn(['active', 'section_id']) ===
        existingSections['AI Agent']

    const ticket = useAppSelector(getTicketState)
    const account = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector((state) => state.currentUser)

    const ticketId: number = ticket.get('id')
    const accountId: number = account.get('id')
    const userId: number = currentUser.get('id')

    const aiMessages = useAppSelector(getAIAgentMessages)
    const shouldShowTicketLevelFeedback = useMemo(() => {
        if (
            ticket
                .get('tags')
                ?.some((tag: any) => tag?.get?.('name') === 'mkt_ai_journey')
        )
            return true
        const latestAIMessage = aiMessages.at(-1)?.created_datetime
        if (!latestAIMessage) return false

        return (
            new Date(latestAIMessage) <
            new Date(Date.now() - TIME_UNTIL_SHOWING_TICKET_LEVEL_FEEDBACK)
        )
    }, [aiMessages, ticket])

    const { goToTicket: goToNextTicket, isEnabled: isNextEnabled } =
        useGoToNextTicket(
            ticketId?.toString() ?? '',
            TicketInfobarTab.AIFeedback,
        )

    const { data: feedback, isLoading: isLoadingFeedback } = useGetFeedback(
        {
            objectId: ticketId?.toString() ?? '',
            objectType: 'TICKET',
        },
        {
            enabled: !!ticketId,
        },
    )

    const { onKnowledgeResourceCreateClick, onKnowledgeResourceClick } =
        useFeedbackTracking({
            ticketId,
            accountId,
            userId,
        })

    const lastUpdatedMutations = useMemo(() => {
        const maxDate = feedback?.executions?.reduce((acc, execution) => {
            return Math.max(
                acc,
                ...(execution.resources?.map((resource) =>
                    resource.feedback?.updatedDatetime
                        ? new Date(resource.feedback.updatedDatetime).getTime()
                        : 0,
                ) ?? []),
                ...(execution.feedback
                    ?.filter(
                        (feedback) =>
                            feedback.feedbackType ===
                            AiAgentFeedbackTypeEnum.SUGGESTED_RESOURCE,
                    )
                    ?.map((feedback) =>
                        feedback.updatedDatetime
                            ? new Date(feedback.updatedDatetime).getTime()
                            : 0,
                    ) ?? []),
            )
        }, 0)

        return maxDate ? new Date(maxDate) : undefined
    }, [feedback])

    const shopName =
        feedback?.executions?.[0]?.storeConfiguration?.shopName ?? ''

    const shopIntegrationId = useShopIntegrationId(shopName)
    const hasAccessToOpportunities = useHasAccessToOpportunities(shopName)

    const isTopOpportunitiesEnabled = useFlag(
        FeatureFlagKey.IncreaseVisibilityOfOpportunity,
        false,
    )

    const isUseKnowledgeServiceEnabled = useFlag(
        FeatureFlagKey.OpportunitiesMilestone2,
        false,
    )

    const isOpportunitiesEnabled = useMemo(
        () => isTopOpportunitiesEnabled && isUseKnowledgeServiceEnabled,
        [isTopOpportunitiesEnabled, isUseKnowledgeServiceEnabled],
    )

    const { storeConfiguration } = useStoreConfiguration({
        shopName,
        accountDomain: account.get('domain') as string,
        enabled: !!shopName,
    })

    const shopType = storeConfiguration?.shopType ?? ''

    const enrichedFeedbackMetadata = useEnrichFeedbackData({
        storeConfiguration,
        data: feedback,
    })

    const {
        actions,
        articles,
        guidanceArticles,
        sourceItems,
        ingestedFiles,
        storeWebsiteQuestions,
        products,
        isLoading,
    } = useGetAllRelatedResourceData({
        data: feedback,
        storeConfiguration,
        queriesEnabled: true,
    })

    const {
        isLoading: isLoadingEnrichedData,
        enrichedData,
        helpCenters,
    } = useMemo(() => {
        if (!enrichedFeedbackMetadata)
            return {
                isLoading: true,
                enrichedData: undefined,
                helpCenters: [],
                resourceArticles: [],
                resourceGuidanceArticles: [],
            }
        return enrichedFeedbackMetadata
    }, [enrichedFeedbackMetadata])

    const { mutateAsync: upsertFeedback } = useUpsertFeedback({
        objectId: ticketId?.toString() ?? '',
        objectType: 'TICKET',
    })

    const handleIconClick = useCallback(
        async (
            value: AiAgentBinaryFeedbackEnum,
            resource: KnowledgeResource,
        ) => {
            const upsertId = resource.feedback?.id?.toString() ?? uuidv4()

            try {
                if (
                    loadingMutations?.includes(upsertId) ||
                    resource.feedback?.feedbackValue === value
                )
                    return

                setLoadingMutations((oldValue) => [
                    ...(oldValue ?? []),
                    upsertId,
                ])

                const executionId =
                    resource.executionId ??
                    feedback?.executions?.[0]?.executionId

                // should never happen, since we're showing that we're still processing the details of this conversation
                // if there are no executions
                if (!executionId) return

                await upsertFeedback({
                    data: {
                        feedbackToUpsert: [
                            {
                                id: resource.feedback?.id,
                                objectId: ticketId.toString(),
                                objectType: 'TICKET',
                                executionId,
                                targetType: 'KNOWLEDGE_RESOURCE',
                                targetId: resource.resource.id,
                                feedbackValue: value,
                                feedbackType: 'KNOWLEDGE_RESOURCE_BINARY',
                            },
                        ],
                    },
                })
            } catch (error) {
                console.error(error)
            } finally {
                setLoadingMutations((oldValue) =>
                    oldValue?.filter((id) => id !== upsertId),
                )
            }
        },
        [loadingMutations, upsertFeedback, ticketId, feedback],
    )

    const { onSubmitMissingKnowledge } = useFeedbackActions({
        upsertFeedback,
        feedback,
        ticketId,
        storeConfiguration,
        actions,
        guidanceArticles,
        articles,
        sourceItems,
        ingestedFiles,
        storeWebsiteQuestions,
        enrichedData,
        setLoadingMutations,
    })

    const knowledgeResources = useMemo(() => {
        // Always prefer enriched data when available
        if (enrichedData && enrichedData.knowledgeResources.length > 0) {
            // Find all product knowledge IDs
            const productKnowledgeIds = new Set(
                enrichedData.knowledgeResources
                    .filter(
                        (r) =>
                            r.resource.resourceType ===
                            AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE,
                    )
                    .map((r) => r.resource.resourceId),
            )

            // Filter out PRODUCT_RECOMMENDATION if there's a matching PRODUCT_KNOWLEDGE
            const filteredResources = enrichedData.knowledgeResources.filter(
                (resource) => {
                    if (
                        resource.resource.resourceType ===
                        AiAgentKnowledgeResourceTypeEnum.PRODUCT_RECOMMENDATION
                    ) {
                        return !productKnowledgeIds.has(
                            resource.resource.resourceId,
                        )
                    }
                    return true
                },
            )

            return filteredResources.map((resource) => (
                <KnowledgeSourceFeedback
                    key={resource.resource.id}
                    onIconClick={handleIconClick}
                    onKnowledgeResourceClick={onKnowledgeResourceClick}
                    resource={resource}
                    shopName={shopName}
                    shopType={shopType}
                    isMetadataLoading={resource.metadata.isLoading}
                />
            ))
        }

        // Fallback to raw resources only if no enriched data
        const resources = feedback?.executions.flatMap((execution) =>
            execution.resources.map((resource) => ({
                executionId: execution.executionId,
                ...resource,
            })),
        )

        if (!resources || resources.length === 0) {
            return []
        }

        // Find all product knowledge IDs
        const productKnowledgeIds = new Set(
            resources
                .filter(
                    (r) =>
                        r.resourceType ===
                        AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE,
                )
                .map((r) => r.resourceId),
        )

        // Filter out PRODUCT_RECOMMENDATION if there's a matching PRODUCT_KNOWLEDGE
        const filteredResources = resources.filter((resource) => {
            if (
                resource.resourceType ===
                AiAgentKnowledgeResourceTypeEnum.PRODUCT_RECOMMENDATION
            ) {
                return !productKnowledgeIds.has(resource.resourceId)
            }
            return true
        })

        filteredResources.sort((a, b) => {
            const aIndex = knowledgeResourceOrder.indexOf(
                a.resourceType as AiAgentKnowledgeResourceTypeEnum,
            )
            const bIndex = knowledgeResourceOrder.indexOf(
                b.resourceType as AiAgentKnowledgeResourceTypeEnum,
            )

            return aIndex - bIndex
        })

        return filteredResources.map((resource) => (
            <KnowledgeSourceFeedback
                key={resource.id}
                onIconClick={handleIconClick}
                onKnowledgeResourceClick={onKnowledgeResourceClick}
                resource={{
                    executionId: resource.executionId,
                    resource: {
                        id: resource.id,
                        resourceId: resource.resourceId,
                        resourceType: resource.resourceType,
                        resourceSetId: resource.resourceSetId,
                        resourceLocale: resource.resourceLocale,
                        resourceVersion: resource.resourceVersion,
                        resourceTitle: resource.resourceTitle,
                        feedback: resource.feedback,
                    },
                    metadata: {
                        title: resource.resourceTitle,
                        content: 'Content is loading...',
                    },
                    feedback: resource.feedback,
                }}
                shopName={shopName}
                shopType={shopType}
                isMetadataLoading
            />
        ))
    }, [
        feedback,
        enrichedData,
        shopName,
        shopType,
        handleIconClick,
        onKnowledgeResourceClick,
    ])

    return (
        <>
            <div className={css.container}>
                {feedback &&
                feedback.executions.length === 0 &&
                !shouldShowTicketLevelFeedback ? (
                    "We're still processing the details of this conversation. You'll be able to review shortly."
                ) : (
                    <div className={css.feedbackSection}>
                        <AIAgentTicketLevelFeedback
                            upsertFeedback={upsertFeedback}
                            feedback={feedback}
                        />
                        {storeConfiguration ? (
                            <>
                                <Separator className={css.separator} />
                                <div className={css.sourcesContainer}>
                                    <div className={css.heading}>
                                        <span>Review sources used</span>
                                        <AutoSaveBadge
                                            state={
                                                !loadingMutations
                                                    ? AutoSaveState.INITIAL
                                                    : loadingMutations.length >
                                                        0
                                                      ? AutoSaveState.SAVING
                                                      : AutoSaveState.SAVED
                                            }
                                            updatedAt={lastUpdatedMutations}
                                        />
                                    </div>
                                    <div className={css.sources}>
                                        {isLoadingFeedback
                                            ? Array.from({ length: 3 }).map(
                                                  (_, index) => (
                                                      <KnowledgeSourceFeedbackSkeleton
                                                          key={index}
                                                      />
                                                  ),
                                              )
                                            : (feedback?.executions.flatMap(
                                                    (execution) =>
                                                        execution.resources,
                                                ).length ?? 0) > 0
                                              ? knowledgeResources
                                              : 'No knowledge used'}
                                    </div>
                                </div>

                                {shopName && (
                                    <MissingKnowledgeSelect
                                        helpCenterId={
                                            storeConfiguration.helpCenterId
                                        }
                                        guidanceHelpCenterId={
                                            storeConfiguration.guidanceHelpCenterId
                                        }
                                        snippetHelpCenterId={
                                            storeConfiguration.snippetHelpCenterId
                                        }
                                        knowledgeResources={
                                            enrichedData?.knowledgeResources
                                        }
                                        resourcesData={{
                                            isLoading,
                                            actions,
                                            articles,
                                            guidanceArticles,
                                            sourceItems,
                                            ingestedFiles,
                                            storeWebsiteQuestions,
                                            helpCenters,
                                            products,
                                        }}
                                        disabled={isLoadingEnrichedData}
                                        onSubmit={onSubmitMissingKnowledge}
                                        onRemove={onSubmitMissingKnowledge}
                                        initialValues={
                                            enrichedData?.suggestedResources ??
                                            []
                                        }
                                        loadingMutations={loadingMutations}
                                        accountId={accountId}
                                        shopName={shopName}
                                        shopType={shopType}
                                    />
                                )}

                                <CreateKnowledgeSection
                                    helpCenterId={
                                        storeConfiguration.helpCenterId
                                    }
                                    onKnowledgeResourceCreateClick={
                                        onKnowledgeResourceCreateClick
                                    }
                                />
                                {isOpportunitiesEnabled &&
                                    hasAccessToOpportunities && (
                                        <DetectedOpportunitiesBanner
                                            shopName={shopName}
                                            shopIntegrationId={
                                                shopIntegrationId
                                            }
                                            ticketId={ticketId}
                                            isTopOpportunitiesEnabled={
                                                isTopOpportunitiesEnabled
                                            }
                                        />
                                    )}
                            </>
                        ) : (
                            <>
                                <Separator className={css.separator} />
                                <div className={css.sourcesContainer}>
                                    <div className={css.unavailableMessage}>
                                        Additional data not available. You can
                                        still rate the conversation above.
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {showNextTicketButton && (
                <div className={css.footer}>
                    <Button
                        className={css.nextTicketButton}
                        fillStyle="ghost"
                        intent="primary"
                        trailingIcon="keyboard_arrow_right"
                        size="medium"
                        isDisabled={!isNextEnabled}
                        onClick={goToNextTicket}
                    >
                        Review next ticket
                    </Button>
                </div>
            )}
        </>
    )
}

export default AIAgentSimplifiedFeedback
