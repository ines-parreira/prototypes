import { useCallback, useRef, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { Button, Tooltip } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { ArticleTemplateReviewAction } from 'models/helpCenter/types'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import { mapGuidanceFormFieldsToGuidanceArticle } from 'pages/aiAgent/utils/guidance.utils'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
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
import { GuidanceFormFields } from '../../../types'
import { useGuidanceCount } from '../../hooks/useGuidanceCount'
import { Opportunity } from '../../utils/mapAiArticlesToOpportunities'
import { OpportunitiesEmptyState } from '../OpportunitiesEmptyState/OpportunitiesEmptyState'
import { OpportunityDetailsCard } from '../OpportunityDetailsCard/OpportunityDetailsCard'

import css from './OpportunitiesContent.less'

const MAX_GUIDANCES = 100
interface OpportunitiesContentProps {
    selectedOpportunity: Opportunity | null
    shopName: string
    helpCenterId: number
    guidanceHelpCenterId: number
    onArchive: (articleKey: string) => void
    onPublish: (articleKey: string) => void
    markArticleAsReviewed: (
        templateKey: string,
        reviewAction: ArticleTemplateReviewAction,
    ) => void
}

export const OpportunitiesContent = ({
    selectedOpportunity,
    shopName,
    helpCenterId,
    guidanceHelpCenterId,
    onArchive,
    onPublish,
    markArticleAsReviewed,
}: OpportunitiesContentProps) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const [isLoading, setIsLoading] = useState(false)
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false)
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

    const reviewArticle = useUpsertArticleTemplateReview({
        onSuccess: async (__data, [__client, __pathParameters, body]) => {
            await queryClient.invalidateQueries({
                queryKey: aiArticleKeys.list(helpCenterId),
            })

            markArticleAsReviewed(body.template_key, body.action)

            if (body.action === 'archive') {
                onArchive(body.template_key)
            } else if (body.action === 'publish') {
                onPublish(body.template_key)
            }
        },
        onError: async (__error, [__client, __pathParameters, __body]) => {
            await queryClient.invalidateQueries({
                queryKey: aiArticleKeys.list(helpCenterId),
            })
        },
    })

    const handleOpenArchiveModal = useCallback(() => {
        setIsArchiveModalOpen(true)
    }, [])

    const handleConfirmArchive = useCallback(() => {
        if (!selectedOpportunity) return

        setIsLoading(true)
        reviewArticle.mutate([
            undefined,
            { help_center_id: helpCenterId },
            {
                action: 'archive',
                template_key: selectedOpportunity.id,
                reason: null,
            },
        ])
        setIsArchiveModalOpen(false)
        setIsLoading(false)
    }, [selectedOpportunity, helpCenterId, reviewArticle])

    const handleCancelArchive = useCallback(() => {
        setIsArchiveModalOpen(false)
    }, [])
    const { guidanceCount, isLoading: isLoadingGuidanceCount } =
        useGuidanceCount({
            guidanceHelpCenterId: helpCenterId,
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
            // Create the guidance
            await createGuidanceArticle(
                mapGuidanceFormFieldsToGuidanceArticle(
                    currentFormData,
                    locale,
                    selectedOpportunity.id,
                ),
            )

            dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Guidance successfully created',
                }),
            )

            reviewArticle.mutate([
                undefined,
                { help_center_id: helpCenterId },
                {
                    action: 'archive',
                    template_key: selectedOpportunity.id,
                    reason: 'Created as guidance',
                },
            ])
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
    ])

    return (
        <div className={css.containerContent}>
            <div className={css.header}>
                <h3 className={css.title}>Opportunities</h3>
                {selectedOpportunity && (
                    <div className={css.headerActions}>
                        <Button
                            intent="secondary"
                            fillStyle="ghost"
                            onClick={handleOpenArchiveModal}
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
                                            . To save this Guidance, you delete
                                            an existing one.
                                        </div>
                                    </Tooltip>
                                )}
                        </div>
                    </div>
                )}
            </div>
            <div className={css.contentBody}>
                {selectedOpportunity ? (
                    <div className={css.opportunityDetails}>
                        <OpportunityDetailsCard
                            type={selectedOpportunity.type}
                            title={selectedOpportunity.title}
                        />
                        <div className={css.guidanceFormWrapper}>
                            <GuidanceForm
                                key={selectedOpportunity.id}
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

            <Modal
                isOpen={isArchiveModalOpen}
                onClose={handleCancelArchive}
                size="small"
            >
                <ModalHeader title="Dismiss opportunity?" />
                <ModalBody>
                    <p>
                        Dismissing this opportunity will delete the associated
                        knowledge and cannot be undone.
                    </p>
                </ModalBody>
                <ModalActionsFooter>
                    <Button intent="secondary" onClick={handleCancelArchive}>
                        Cancel
                    </Button>
                    <Button intent="destructive" onClick={handleConfirmArchive}>
                        Dismiss
                    </Button>
                </ModalActionsFooter>
            </Modal>
        </div>
    )
}
