import { useCallback, useRef, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { ArticleTemplateReviewAction } from 'models/helpCenter/types'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import { DismissOpportunityModal } from 'pages/aiAgent/opportunities/components/DismissOpportunityModal/DismissOpportunityModal'
import { mapGuidanceFormFieldsToGuidanceArticle } from 'pages/aiAgent/utils/guidance.utils'
import { HELP_CENTER_DEFAULT_LOCALE } from 'pages/settings/helpCenter/constants'
import {
    aiArticleKeys,
    useUpsertArticleTemplateReview,
} from 'pages/settings/helpCenter/queries'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { getViewLanguage } from 'state/ui/helpCenter'

import { GuidanceForm } from '../../../components/GuidanceForm/GuidanceForm'
import { useAiAgentNavigation } from '../../../hooks/useAiAgentNavigation'
import type { GuidanceFormFields } from '../../../types'
import { OpportunityType } from '../../enums'
import { useGuidanceCount } from '../../hooks/useGuidanceCount'
import {
    buildApprovePayload,
    buildDismissPayload,
    useProcessOpportunity,
} from '../../hooks/useProcessOpportunity'
import type { Opportunity } from '../../utils/mapAiArticlesToOpportunities'
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
    opportunities?: Opportunity[]
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
    const approveButtonRef = useRef<HTMLButtonElement>(null)

    const locale = useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE

    const { guidanceActions, isLoading: isLoadingActions } =
        useGetGuidancesAvailableActions(shopName, 'shopify')

    const { createGuidanceArticle, isGuidanceArticleUpdating } =
        useGuidanceArticleMutation({ guidanceHelpCenterId })

    const processOpportunity = useProcessOpportunity(shopIntegrationId)

    const showEmptyState = !opportunities || opportunities.length === 0

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

    const handleOpenDismissModal = useCallback(() => {
        setIsDismissModalOpen(true)
    }, [])

    const handleConfirmDismiss = useCallback(async () => {
        if (!selectedOpportunity) return

        setIsLoading(true)
        try {
            if (useKnowledgeService) {
                await processOpportunity.mutateAsync({
                    opportunityId: parseInt(selectedOpportunity.id, 10),
                    data: buildDismissPayload(),
                })
                onOpportunityDismissed?.({
                    opportunityId: selectedOpportunity.id,
                    opportunityType: selectedOpportunity.type,
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
                    message: 'Failed to dismiss opportunity. Please try again.',
                }),
            )
        } finally {
            setIsLoading(false)
        }
    }, [
        selectedOpportunity,
        helpCenterId,
        reviewArticle,
        useKnowledgeService,
        processOpportunity,
        onOpportunityDismissed,
        onArchive,
        dispatch,
    ])

    const handleCancelDismiss = useCallback(() => {
        setIsDismissModalOpen(false)
    }, [])

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
            if (useKnowledgeService) {
                await processOpportunity.mutateAsync({
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
                    message: 'Guidance successfully created',
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
    ])

    if (showEmptyState) {
        return <OpportunitiesEmptyState />
    }

    return (
        <div className={css.containerContent}>
            <div className={css.header}>
                <h3 className={css.title}>
                    {selectedOpportunity?.type ===
                    OpportunityType.FILL_KNOWLEDGE_GAP
                        ? 'Fill knowledge gap'
                        : 'Resolve conflict'}
                </h3>
                {selectedOpportunity && (
                    <div className={css.headerActions}>
                        <OpportunitiesNavigation
                            opportunities={opportunities}
                            selectedOpportunity={selectedOpportunity}
                            selectCertainOpportunity={selectCertainOpportunity}
                            totalCount={totalCount}
                        />
                        <Button
                            intent="secondary"
                            fillStyle="ghost"
                            onClick={handleOpenDismissModal}
                        >
                            Dismiss
                        </Button>
                        <div
                            style={{
                                position: 'relative',
                                display: 'inline-block',
                            }}
                        >
                            <Button
                                ref={approveButtonRef}
                                className={css.approveButton}
                                intent="primary"
                                onClick={handleApprove}
                                isLoading={
                                    isLoading ||
                                    reviewArticle.isLoading ||
                                    isGuidanceArticleUpdating
                                }
                                isDisabled={isApproveDisabled}
                            >
                                <i className="material-icons">check</i>
                                Approve
                            </Button>
                            {!isLoadingGuidanceCount &&
                                guidanceCount >= MAX_GUIDANCES &&
                                approveButtonRef.current && (
                                    <Tooltip
                                        placement="top"
                                        target={approveButtonRef.current}
                                        trigger={['hover']}
                                        delay={{ show: 0, hide: 300 }}
                                        autohide={false}
                                    >
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
                                            . To save this Guidance, you must
                                            delete or disable an existing one.
                                        </div>
                                    </Tooltip>
                                )}
                        </div>
                    </div>
                )}
            </div>
            <div className={css.contentBody}>
                {isLoadingOpportunityDetails ? (
                    <OpportunitiesContentSkeleton />
                ) : selectedOpportunity ? (
                    <div className={css.opportunityDetails}>
                        <OpportunityDetailsCard
                            type={selectedOpportunity.type}
                            title={selectedOpportunity.title}
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
                                onSubmit={() => {
                                    return Promise.resolve()
                                }}
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
                            />
                        </div>
                    </div>
                ) : (
                    <OpportunitiesEmptyState />
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
