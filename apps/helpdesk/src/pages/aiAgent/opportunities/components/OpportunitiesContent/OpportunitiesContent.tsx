import { useCallback, useEffect, useRef, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    Button,
    Heading,
    Skeleton,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'
import type { FeedbackMutation } from '@gorgias/knowledge-service-types'

import { SentryTeam } from 'common/const/sentryTeamNames'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { ArticleTemplateReviewAction } from 'models/helpCenter/types'
import { useUpsertFeedback } from 'models/knowledgeService/mutations'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import { DismissOpportunityModal } from 'pages/aiAgent/opportunities/components/DismissOpportunityModal/DismissOpportunityModal'
import type { OpportunityPageState } from 'pages/aiAgent/opportunities/hooks/useOpportunityPageState'
import type {
    Opportunity,
    SidebarOpportunityItem,
} from 'pages/aiAgent/opportunities/types'
import { mapGuidanceFormFieldsToGuidanceArticle } from 'pages/aiAgent/utils/guidance.utils'
import { HELP_CENTER_DEFAULT_LOCALE } from 'pages/settings/helpCenter/constants'
import {
    aiArticleKeys,
    useUpsertArticleTemplateReview,
} from 'pages/settings/helpCenter/queries'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { getViewLanguage } from 'state/ui/helpCenter'
import { reportError } from 'utils/errors'

import { FeedbackObjectType } from '../../../../tickets/detail/components/AIAgentFeedbackBar/types'
import { GuidanceForm } from '../../../components/GuidanceForm/GuidanceForm'
import { useAiAgentNavigation } from '../../../hooks/useAiAgentNavigation'
import type { GuidanceFormFields } from '../../../types'
import { OpportunityType } from '../../enums'
import { useGuidanceCount } from '../../hooks/useGuidanceCount'
import { useOpportunitiesSidebar } from '../../hooks/useOpportunitiesSidebar'
import {
    buildApprovePayload,
    buildDismissPayload,
    useProcessOpportunity,
} from '../../hooks/useProcessOpportunity'
import { OpportunitiesContentSkeleton } from '../OpportunitiesContentSkeleton/OpportunitiesContentSkeleton'
import { OpportunitiesEmptyState } from '../OpportunitiesEmptyState/OpportunitiesEmptyState'
import { OpportunitiesNavigation } from '../OpportunitiesNavigation/OpportunitiesNavigation'
import { OpportunityDetailsCard } from '../OpportunityDetailsCard/OpportunityDetailsCard'
import { OpportunityTicketDrillDownModal } from '../OpportunityTicketDrillDownModal/OpportunityTicketDrillDownModal'

import css from './OpportunitiesContent.less'

const MAX_GUIDANCES = 100
interface OpportunitiesContentProps {
    selectedOpportunity: Opportunity | null
    shopName: string
    shopIntegrationId: number | undefined
    helpCenterId: number
    guidanceHelpCenterId: number
    onArchive: (articleKey: string) => void
    onPublish: (articleKey: string) => void
    markArticleAsReviewed: (
        templateKey: string,
        reviewAction: ArticleTemplateReviewAction,
    ) => void
    opportunities?: SidebarOpportunityItem[]
    selectCertainOpportunity?: (index: number) => void
    onOpportunityAccepted?: (context: {
        opportunityId: string
        opportunityType: string
    }) => void
    onOpportunityDismissed?: (context: {
        opportunityId: string
        opportunityType: string
    }) => void
    useKnowledgeService: boolean
    isLoadingOpportunityDetails: boolean
    totalCount: number
    opportunitiesPageState: OpportunityPageState
}

export const OpportunitiesContent = ({
    selectedOpportunity,
    shopName,
    shopIntegrationId,
    helpCenterId,
    guidanceHelpCenterId,
    onArchive,
    onPublish,
    markArticleAsReviewed,
    opportunities,
    selectCertainOpportunity,
    onOpportunityAccepted,
    onOpportunityDismissed,
    useKnowledgeService,
    isLoadingOpportunityDetails,
    totalCount,
    opportunitiesPageState,
}: OpportunitiesContentProps) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const [isLoading, setIsLoading] = useState(false)
    const [isDismissModalOpen, setIsDismissModalOpen] = useState(false)
    const [isTicketDrillDownModalOpen, setIsTicketDrillDownModalOpen] =
        useState(false)
    const [currentFormData, setCurrentFormData] = useState<GuidanceFormFields>({
        name: selectedOpportunity?.title || '',
        content: selectedOpportunity?.content || '',
        isVisible: true,
    })
    const [isTitleOverflowing, setIsTitleOverflowing] = useState(false)
    const approveButtonRef = useRef<HTMLButtonElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)

    const locale = useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE

    const { guidanceActions, isLoading: isLoadingActions } =
        useGetGuidancesAvailableActions(shopName, 'shopify')

    const { createGuidanceArticle, isGuidanceArticleUpdating } =
        useGuidanceArticleMutation({ guidanceHelpCenterId })

    const processOpportunity = useProcessOpportunity(shopIntegrationId)

    const { isSidebarVisible, setIsSidebarVisible } = useOpportunitiesSidebar()

    useEffect(() => {
        if (titleRef.current) {
            const isOverflowing =
                titleRef.current.scrollWidth > titleRef.current.offsetWidth
            setIsTitleOverflowing(isOverflowing)
        }
    }, [selectedOpportunity?.id])

    const handleShowSidebar = useCallback(() => {
        setIsSidebarVisible(true)
    }, [setIsSidebarVisible])

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

    const { mutateAsync: upsertFeedback } = useUpsertFeedback({
        objectType: FeedbackObjectType.OPPORTUNITY,
        objectId: selectedOpportunity?.id || '',
        executionId: '00000000-0000-0000-0000-000000000000',
    })

    const submitFeedback = useCallback(
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

    const handleOpenDismissModal = useCallback(() => {
        setIsDismissModalOpen(true)
    }, [])

    const handleConfirmDismiss = useCallback(
        async (feedbackData: { feedbackToUpsert: FeedbackMutation[] }) => {
            if (!selectedOpportunity) return

            setIsLoading(true)
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

                submitFeedback(feedbackData)

                dispatch(
                    notify({
                        message: 'Successfully dismissed opportunity',
                        status: NotificationStatus.Success,
                    }),
                )
                setIsDismissModalOpen(false)
            } catch {
                dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message:
                            'Failed to dismiss opportunity. Please try again.',
                    }),
                )
            } finally {
                setIsLoading(false)
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
            submitFeedback,
            shopIntegrationId,
        ],
    )

    const handleCancelDismiss = useCallback(() => {
        setIsDismissModalOpen(false)
    }, [])

    const getOpportunityTypeLabel = (type: OpportunityType): string => {
        switch (type) {
            case OpportunityType.RESOLVE_CONFLICT:
                return 'Resolve conflict'
            case OpportunityType.FILL_KNOWLEDGE_GAP:
            default:
                return 'Fill knowledge gap'
        }
    }

    const SelectedOpportunityTitle = () => {
        const typeLabel = getOpportunityTypeLabel(
            selectedOpportunity?.type || OpportunityType.FILL_KNOWLEDGE_GAP,
        )
        const titleText = `${typeLabel}: ${selectedOpportunity?.title}`

        const titleElement = (
            <Heading size="sm" className={css.title} ref={titleRef}>
                {titleText}
            </Heading>
        )

        if (!isTitleOverflowing) {
            return titleElement
        }

        return (
            <Tooltip placement="bottom">
                <TooltipTrigger>
                    <span className={css.title}>{titleElement}</span>
                </TooltipTrigger>
                <TooltipContent title={titleText} />
            </Tooltip>
        )
    }

    const handleOpenTicketDrillDownModal = useCallback(() => {
        if (
            selectedOpportunity?.detectionObjectIds &&
            selectedOpportunity.detectionObjectIds.length > 0
        ) {
            setIsTicketDrillDownModalOpen(true)
        } else {
            console.warn(
                'No detectionObjectIds available for opportunity:',
                selectedOpportunity,
            )
        }
    }, [selectedOpportunity])

    const handleCloseTicketDrillDownModal = useCallback(() => {
        setIsTicketDrillDownModalOpen(false)
    }, [])
    const { guidanceCount, isLoading: isLoadingGuidanceCount } =
        useGuidanceCount({
            guidanceHelpCenterId,
            shopName,
        })

    const { routes } = useAiAgentNavigation({ shopName })

    const isApproveDisabled =
        isLoadingGuidanceCount || guidanceCount >= MAX_GUIDANCES

    const onFormValuesChange = (fields: GuidanceFormFields) => {
        setCurrentFormData(fields)
    }

    const handleApprove = useCallback(async () => {
        if (!selectedOpportunity) return

        setIsLoading(true)
        try {
            if (useKnowledgeService && shopIntegrationId) {
                await processOpportunity.mutateAsync({
                    shopIntegrationId,
                    opportunityId: parseInt(selectedOpportunity.id, 10),
                    data: buildApprovePayload({
                        isVisible: currentFormData.isVisible,
                        title: currentFormData.name,
                        content: currentFormData.content,
                    }),
                })
                onArchive(selectedOpportunity.key)
            } else {
                await createGuidanceArticle(
                    mapGuidanceFormFieldsToGuidanceArticle(
                        currentFormData,
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
        } catch {
            dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to create guidance. Please try again.',
                }),
            )
        } finally {
            setIsLoading(false)
        }
    }, [
        selectedOpportunity,
        helpCenterId,
        reviewArticle,
        createGuidanceArticle,
        currentFormData,
        locale,
        dispatch,
        onOpportunityAccepted,
        useKnowledgeService,
        processOpportunity,
        onArchive,
        shopIntegrationId,
    ])

    if (opportunitiesPageState.isLoading || isLoadingOpportunityDetails) {
        return (
            <div className={css.containerContent}>
                <div className={css.header}>
                    <div className={css.skeletonHeader}>
                        <Skeleton height={24} />
                    </div>
                </div>
                <div className={css.contentBody}>
                    <OpportunitiesContentSkeleton />
                </div>
            </div>
        )
    }

    if (opportunitiesPageState.showEmptyState || !selectedOpportunity) {
        return (
            <div className={css.containerContent}>
                <div className={css.header}></div>
                <OpportunitiesEmptyState
                    opportunitiesPageState={opportunitiesPageState}
                />
            </div>
        )
    }

    return (
        <div className={css.containerContent}>
            <div className={css.header}>
                {isLoadingOpportunityDetails ? (
                    <div className={css.skeletonHeader}>
                        <Skeleton height={24} />
                    </div>
                ) : (
                    <>
                        <div className={css.headerLeft}>
                            {!isSidebarVisible && (
                                <Button
                                    intent="regular"
                                    variant="secondary"
                                    icon="system-bar-left"
                                    size="sm"
                                    onClick={handleShowSidebar}
                                    aria-label="Show sidebar"
                                />
                            )}

                            <SelectedOpportunityTitle />
                        </div>
                        {selectedOpportunity && (
                            <div className={css.headerActions}>
                                <OpportunitiesNavigation
                                    opportunities={opportunities}
                                    selectedOpportunity={selectedOpportunity}
                                    selectCertainOpportunity={
                                        selectCertainOpportunity
                                    }
                                    totalCount={totalCount}
                                />
                                <div className={css.headerActionDelimiter} />
                                <Button
                                    variant="tertiary"
                                    onClick={handleOpenDismissModal}
                                >
                                    Dismiss
                                </Button>
                                {!isLoadingGuidanceCount &&
                                guidanceCount >= MAX_GUIDANCES ? (
                                    <Tooltip placement="top">
                                        <TooltipTrigger>
                                            <Button
                                                ref={approveButtonRef}
                                                variant="primary"
                                                leadingSlot="check"
                                                onClick={handleApprove}
                                                isLoading={
                                                    isLoading ||
                                                    reviewArticle.isLoading ||
                                                    isGuidanceArticleUpdating
                                                }
                                                isDisabled={isApproveDisabled}
                                            >
                                                Publish and enable
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <div>
                                                You have reached the limit for{' '}
                                                <a
                                                    href={routes.guidance}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={css.guidanceLink}
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    Guidance
                                                </a>
                                                . To save this Guidance, you
                                                must delete or disable an
                                                existing one.
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <Button
                                        ref={approveButtonRef}
                                        className={css.approveButton}
                                        variant="primary"
                                        leadingSlot="check"
                                        onClick={handleApprove}
                                        isLoading={
                                            isLoading ||
                                            reviewArticle.isLoading ||
                                            isGuidanceArticleUpdating
                                        }
                                        isDisabled={isApproveDisabled}
                                    >
                                        Publish and enable
                                    </Button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className={css.contentBody}>
                {selectedOpportunity && (
                    <div className={css.opportunityDetails}>
                        <OpportunityDetailsCard
                            type={selectedOpportunity.type}
                            ticketCount={selectedOpportunity.ticketCount}
                            onTicketCountClick={handleOpenTicketDrillDownModal}
                        />
                        <div className={css.guidanceFormWrapper}>
                            <GuidanceForm
                                key={selectedOpportunity.key}
                                availableActions={guidanceActions}
                                shopName={shopName}
                                isLoading={
                                    isLoading ||
                                    isLoadingActions ||
                                    reviewArticle.isLoading ||
                                    isGuidanceArticleUpdating
                                }
                                actionType="create"
                                onSubmit={handleApprove}
                                onValuesChange={onFormValuesChange}
                                initialFields={{
                                    name: selectedOpportunity.title,
                                    content: selectedOpportunity.content,
                                    isVisible: true,
                                }}
                                sourceType="ai"
                                helpCenterId={helpCenterId}
                                hideHeader
                                hideFooterAlerts
                                hideFooterButtons
                                hideAvailableForAiAgentToggle
                                showUnsavedChangesPrompt
                                unsavedChangesPromptTitle="Publish and enable Guidance?"
                                unsavedChangesPromptBody="Your changes to this Guidance will be lost if you navigate elsewhere and don’t publish it."
                                unsavedChangesPromptPrimaryCTAText="Publish and enable"
                            />
                        </div>
                    </div>
                )}
            </div>

            <DismissOpportunityModal
                isOpen={isDismissModalOpen}
                opportunity={selectedOpportunity}
                onClose={handleCancelDismiss}
                onConfirm={handleConfirmDismiss}
                onOpportunityDismissed={onOpportunityDismissed}
            />

            {selectedOpportunity?.detectionObjectIds && (
                <OpportunityTicketDrillDownModal
                    isOpen={isTicketDrillDownModalOpen}
                    onClose={handleCloseTicketDrillDownModal}
                    ticketIds={selectedOpportunity.detectionObjectIds}
                />
            )}
        </div>
    )
}
