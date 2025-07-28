import { useCallback, useMemo, useState } from 'react'

import { v4 as uuidv4 } from 'uuid'

import { Button, Separator } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { useUpsertFeedback } from 'models/knowledgeService/mutations'
import { useGetFeedback } from 'models/knowledgeService/queries'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import CurrentHelpCenterContext from 'pages/settings/helpCenter/contexts/CurrentHelpCenterContext'
import { EditionManagerContextProvider } from 'pages/settings/helpCenter/providers/EditionManagerContext'
import { SupportedLocalesProvider } from 'pages/settings/helpCenter/providers/SupportedLocales'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentSimplifiedFeedback.less'
import AutoSaveBadge from 'pages/tickets/detail/components/AIAgentFeedbackBar/AutoSaveBadge'
import CreateKnowledgeSection from 'pages/tickets/detail/components/AIAgentFeedbackBar/CreateKnowledgeSection'
import FeedbackInternalNote from 'pages/tickets/detail/components/AIAgentFeedbackBar/FeedbackInternalNote'
import { useFeedbackActions } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useFeedbackActions'
import { useFeedbackTracking } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useFeedbackTracking'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import KnowledgeSourceFeedback from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceFeedback'
import { KnowledgeSourceFeedbackSkeleton } from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceFeedbackSkeleton'
import KnowledgeSourceSideBar from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSideBar'
import MissingKnowledgeSelect from 'pages/tickets/detail/components/AIAgentFeedbackBar/MissingKnowledgeSelect'
import {
    AiAgentBinaryFeedbackEnum,
    AiAgentFeedbackTypeEnum,
    AiAgentKnowledgeResourceTypeEnum,
    AutoSaveState,
    KnowledgeResource,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { UnsavedChangesModalProvider } from 'pages/tickets/detail/components/AIAgentFeedbackBar/UnsavedChangesModalProvider'
import { getHelpCenterIdByResourceType } from 'pages/tickets/detail/components/AIAgentFeedbackBar/utils'
import useGoToNextTicket from 'pages/tickets/detail/components/TicketNavigation/hooks/useGoToNextTicket'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getSectionIdByName } from 'state/entities/sections/selectors'
import { getTicketState } from 'state/ticket/selectors'
import { TicketAIAgentFeedbackTab } from 'state/ui/ticketAIAgentFeedback/constants'
import { getViewsState } from 'state/views/selectors'

import { AIAgentTicketLevelFeedback } from './AIAgentTicketLevelFeedback/AIAgentTicketLevelFeedback'
import { useEnrichFeedbackData } from './useEnrichKnowledgeFeedbackData/useEnrichFeedbackData'
import { useGetAllRelatedResourceData } from './useEnrichKnowledgeFeedbackData/useGetAllRelatedResourceData'
import { knowledgeResourceOrder } from './useEnrichKnowledgeFeedbackData/utils'

const AIAgentSimplifiedFeedback = () => {
    const [loadingMutations, setLoadingMutations] = useState<string[]>()
    const viewsState = useAppSelector(getViewsState)
    const existingSections = useAppSelector(getSectionIdByName)
    const { selectedResource } = useKnowledgeSourceSideBar()
    const showTicketLevelFeedback = useFlag(FeatureFlagKey.TicketLevelFeedback)

    const showNextTicketButton =
        viewsState.getIn(['active', 'section_id']) ===
        existingSections['AI Agent']

    const [loadingFreeFormMutation, setLoadingFreeFormMutation] =
        useState<boolean>()

    const ticket = useAppSelector(getTicketState)
    const account = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector((state) => state.currentUser)

    const ticketId: number = ticket.get('id')
    const accountId: number = account.get('id')
    const userId: number = currentUser.get('id')

    const { goToTicket: goToNextTicket, isEnabled: isNextEnabled } =
        useGoToNextTicket(ticketId.toString(), TicketAIAgentFeedbackTab.AIAgent)

    const { data: feedback, isLoading: isLoadingFeedback } = useGetFeedback({
        objectId: ticketId.toString(),
        objectType: 'TICKET',
    })

    const {
        onKnowledgeResourceClick,
        onKnowledgeResourceEditClick,
        onKnowledgeResourceCreateClick,
        onKnowledgeResourceSaved,
    } = useFeedbackTracking({
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
        resourceArticles,
        resourceGuidanceArticles,
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
        objectId: ticketId.toString(),
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

    const handleFreeFormFeedbackChange = useCallback(
        async (value: string) => {
            setLoadingFreeFormMutation(true)

            const executionId =
                enrichedData?.freeForm?.executionId ??
                feedback?.executions?.[0]?.executionId

            // should never happen, since we're showing that we're still processing the details of this conversation
            // if there are no executions
            if (!executionId) return

            await upsertFeedback({
                data: {
                    feedbackToUpsert: [
                        {
                            id: enrichedData?.freeForm?.feedback?.id,
                            objectId: ticketId.toString(),
                            objectType: 'TICKET',
                            executionId: executionId,
                            targetType: 'TICKET',
                            targetId: ticketId.toString(),
                            feedbackValue: value,
                            feedbackType: 'TICKET_FREEFORM',
                        },
                    ],
                },
            })

            setLoadingFreeFormMutation(false)
        },
        [
            ticketId,
            upsertFeedback,
            enrichedData?.freeForm?.executionId,
            enrichedData?.freeForm?.feedback?.id,
            feedback?.executions,
        ],
    )

    const { onSubmitMissingKnowledge, onSubmitNewMissingKnowledge } =
        useFeedbackActions({
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

    const helpCenter = useMemo(() => {
        if (!helpCenters || !selectedResource) return null

        if (!selectedResource?.helpCenterId) {
            const storeConfigurationHelpCenterId =
                getHelpCenterIdByResourceType(
                    storeConfiguration,
                    selectedResource.knowledgeResourceType,
                )
            return helpCenters.find(
                (helpCenter) =>
                    !!helpCenter &&
                    helpCenter.id === storeConfigurationHelpCenterId,
            )
        }

        return helpCenters.find(
            (helpCenter) =>
                !!helpCenter &&
                helpCenter.id === Number(selectedResource.helpCenterId),
        )
    }, [helpCenters, selectedResource, storeConfiguration])

    const knowledgeResources = useMemo(() => {
        const resources = feedback?.executions.flatMap((execution) =>
            execution.resources.map((resource) => ({
                executionId: execution.executionId,
                ...resource,
            })),
        )

        if (
            (resources?.length ?? 0) !==
            (enrichedData?.knowledgeResources?.length ?? 0)
        ) {
            resources?.sort((a, b) => {
                const aIndex = knowledgeResourceOrder.indexOf(
                    a.resourceType as AiAgentKnowledgeResourceTypeEnum,
                )
                const bIndex = knowledgeResourceOrder.indexOf(
                    b.resourceType as AiAgentKnowledgeResourceTypeEnum,
                )

                return aIndex - bIndex
            })
            return resources?.map((resource) => (
                <KnowledgeSourceFeedback
                    key={resource.id}
                    onIconClick={handleIconClick}
                    resource={{
                        executionId: resource.executionId,
                        resource: {
                            id: resource.id,
                            resourceId: resource.resourceId,
                            resourceType: resource.resourceType,
                            resourceSetId: resource.resourceSetId,
                            resourceLocale: resource.resourceLocale,
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
                    onKnowledgeResourceClick={onKnowledgeResourceClick}
                    isMetadataLoading
                />
            ))
        }
        return enrichedData?.knowledgeResources.map((resource) => (
            <KnowledgeSourceFeedback
                key={resource.resource.id}
                onIconClick={handleIconClick}
                resource={resource}
                shopName={shopName}
                shopType={shopType}
                onKnowledgeResourceClick={onKnowledgeResourceClick}
                isMetadataLoading={resource.metadata.isLoading}
            />
        ))
    }, [
        feedback,
        enrichedData,
        shopName,
        shopType,
        onKnowledgeResourceClick,
        handleIconClick,
    ])

    return (
        <>
            <div className={css.container}>
                {feedback && feedback.executions.length === 0 ? (
                    "We're still processing the details of this conversation. You'll be able to review shortly."
                ) : (
                    <div className={css.feedbackSection}>
                        {showTicketLevelFeedback && (
                            <>
                                <AIAgentTicketLevelFeedback
                                    upsertFeedback={upsertFeedback}
                                    feedback={feedback}
                                />
                                <Separator className={css.separator} />
                            </>
                        )}
                        <div className={css.sourcesContainer}>
                            <div className={css.heading}>
                                <span>Review sources used</span>
                                <AutoSaveBadge
                                    state={
                                        !loadingMutations
                                            ? AutoSaveState.INITIAL
                                            : loadingMutations.length > 0
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
                                            (execution) => execution.resources,
                                        ).length ?? 0) > 0
                                      ? knowledgeResources
                                      : 'No knowledge used'}
                            </div>
                        </div>

                        {shopName && (
                            <MissingKnowledgeSelect
                                helpCenterId={storeConfiguration?.helpCenterId}
                                guidanceHelpCenterId={
                                    storeConfiguration?.guidanceHelpCenterId
                                }
                                snippetHelpCenterId={
                                    storeConfiguration?.snippetHelpCenterId
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
                                    enrichedData?.suggestedResources ?? []
                                }
                                loadingMutations={loadingMutations}
                                accountId={accountId}
                                shopName={shopName}
                                shopType={shopType}
                                onKnowledgeResourceClick={
                                    onKnowledgeResourceClick
                                }
                            />
                        )}

                        <CreateKnowledgeSection
                            shopName={shopName as string}
                            helpCenterId={storeConfiguration?.helpCenterId}
                            onKnowledgeResourceCreateClick={
                                onKnowledgeResourceCreateClick
                            }
                        />
                        {!showTicketLevelFeedback && (
                            <>
                                <Separator className={css.separator} />
                                <FeedbackInternalNote
                                    onDebouncedChange={
                                        handleFreeFormFeedbackChange
                                    }
                                    isMutationLoading={loadingFreeFormMutation}
                                    initialValue={
                                        enrichedData?.freeForm?.feedback
                                            ?.feedbackValue ?? ''
                                    }
                                    lastUpdated={
                                        enrichedData?.freeForm?.feedback
                                            ?.updatedDatetime
                                    }
                                />
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

            {!!helpCenter && (
                <SupportedLocalesProvider>
                    <CurrentHelpCenterContext.Provider value={helpCenter}>
                        <UnsavedChangesModalProvider>
                            <EditionManagerContextProvider>
                                <KnowledgeSourceSideBar
                                    articles={resourceArticles ?? []}
                                    guidanceArticles={
                                        resourceGuidanceArticles ?? []
                                    }
                                    shopName={shopName}
                                    shopType={shopType}
                                    onSubmitNewMissingKnowledge={
                                        onSubmitNewMissingKnowledge
                                    }
                                    onKnowledgeResourceEditClick={
                                        onKnowledgeResourceEditClick
                                    }
                                    onKnowledgeResourceSaved={
                                        onKnowledgeResourceSaved
                                    }
                                />
                            </EditionManagerContextProvider>
                        </UnsavedChangesModalProvider>
                    </CurrentHelpCenterContext.Provider>
                </SupportedLocalesProvider>
            )}
        </>
    )
}

export default AIAgentSimplifiedFeedback
