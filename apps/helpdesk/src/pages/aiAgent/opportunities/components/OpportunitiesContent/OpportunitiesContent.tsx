import { useCallback, useEffect, useState } from 'react'

import { Skeleton } from '@gorgias/axiom'
import type { FeedbackMutation } from '@gorgias/knowledge-service-types'

import { DismissOpportunityModal } from 'pages/aiAgent/opportunities/components/DismissOpportunityModal/DismissOpportunityModal'
import { OpportunityDetailsHeader } from 'pages/aiAgent/opportunities/components/OpportunityDetailsHeader/OpportunityDetailsHeader'
import { State } from 'pages/aiAgent/opportunities/hooks/useOpportunityPageState'
import type { OpportunityPageState } from 'pages/aiAgent/opportunities/hooks/useOpportunityPageState'
import type {
    Opportunity,
    SidebarOpportunityItem,
} from 'pages/aiAgent/opportunities/types'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'

import type { GuidanceFormFields } from '../../../types'
import { OpportunityType } from '../../enums'
import { useOpportunityCTAs } from '../../hooks/useOpportunityCTAs'
import type { OpportunityConfig } from '../../types'
import { OpportunitiesContentSkeleton } from '../OpportunitiesContentSkeleton/OpportunitiesContentSkeleton'
import { OpportunitiesEmptyState } from '../OpportunitiesEmptyState/OpportunitiesEmptyState'
import { OpportunityDetailsContent } from '../OpportunityDetailsContent/OpportunityDetailsContent'
import type { GuidanceFormFields as GuidanceFormFieldsFromOpportunityEditor } from '../OpportunityGuidanceEditor/OpportunityGuidanceEditor'
import { OpportunityTicketDrillDownModal } from '../OpportunityTicketDrillDownModal/OpportunityTicketDrillDownModal'
import { RestrictedOpportunityMessage } from '../RestrictedOpportunityMessage/RestrictedOpportunityMessage'

import css from './OpportunitiesContent.less'

interface OpportunitiesContentProps {
    selectedOpportunity: Opportunity | null
    opportunityConfig: OpportunityConfig
    opportunities?: SidebarOpportunityItem[]
    selectCertainOpportunity?: (index: number) => void
    isLoadingOpportunityDetails: boolean
    totalCount: number
    opportunitiesPageState: OpportunityPageState
    allowedOpportunityIds?: number[]
}

export const OpportunitiesContent = ({
    selectedOpportunity,
    opportunityConfig,
    opportunities,
    selectCertainOpportunity,
    isLoadingOpportunityDetails,
    totalCount,
    opportunitiesPageState,
    allowedOpportunityIds,
}: OpportunitiesContentProps) => {
    const [isDismissModalOpen, setIsDismissModalOpen] = useState(false)
    const [isTicketDrillDownModalOpen, setIsTicketDrillDownModalOpen] =
        useState(false)

    const [editorFormData, setEditorFormData] =
        useState<GuidanceFormFieldsFromOpportunityEditor>({
            title: selectedOpportunity?.title || '',
            body: selectedOpportunity?.content || '',
            isVisible: true,
        })

    const currentFormData: GuidanceFormFields = {
        name: editorFormData.title,
        content: editorFormData.body,
        isVisible: editorFormData.isVisible,
    }

    const opportunityCTAs = useOpportunityCTAs({
        selectedOpportunity,
        currentFormData,
        opportunityConfig,
    })

    const handleOpenDismissModal = useCallback(() => {
        setIsDismissModalOpen(true)
    }, [])

    const handleConfirmDismiss = useCallback(
        async (feedbackData: { feedbackToUpsert: FeedbackMutation[] }) => {
            await opportunityCTAs.handleDismiss(feedbackData)
            setIsDismissModalOpen(false)
        },
        [opportunityCTAs],
    )

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

    const handleFormValuesChange = useCallback(
        (fields: GuidanceFormFieldsFromOpportunityEditor) => {
            setEditorFormData(fields)
        },
        [],
    )

    useEffect(() => {
        if (selectedOpportunity) {
            setEditorFormData({
                title: selectedOpportunity.title,
                body: selectedOpportunity.content,
                isVisible: true,
            })
        }
    }, [selectedOpportunity])

    const isFormDirty =
        selectedOpportunity &&
        (editorFormData.title !== selectedOpportunity.title ||
            editorFormData.body !== selectedOpportunity.content)

    const handleSaveChanges = useCallback(async () => {
        if (!selectedOpportunity) return

        if (selectedOpportunity.type === OpportunityType.RESOLVE_CONFLICT) {
            return opportunityCTAs.handleResolve()
        }
        return opportunityCTAs.handleApprove()
    }, [selectedOpportunity, opportunityCTAs])

    const handleResetForm = useCallback(() => {
        if (selectedOpportunity) {
            setEditorFormData({
                title: selectedOpportunity.title,
                body: selectedOpportunity.content,
                isVisible: true,
            })
        }
    }, [selectedOpportunity])

    const getUnsavedChangesPromptProps = () => {
        if (selectedOpportunity?.type === OpportunityType.RESOLVE_CONFLICT) {
            return {
                title: 'Resolve opportunity?',
                body: "Your changes to this opportunity will be lost if you navigate elsewhere and don't resolve it.",
                primaryCtaText: 'Resolve',
            }
        }

        return {
            title: 'Publish and enable Guidance?',
            body: "Your changes to this Guidance will be lost if you navigate elsewhere and don't publish it.",
            primaryCtaText: 'Publish and enable',
        }
    }

    const unsavedChangesPromptProps = getUnsavedChangesPromptProps()

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

    if (opportunitiesPageState.state === State.RESTRICTED_NO_OPPORTUNITIES) {
        return (
            <div className={css.containerContent}>
                <div className={css.header}></div>
                <RestrictedOpportunityMessage
                    opportunitiesPageState={opportunitiesPageState}
                    shopName={opportunityConfig.shopName}
                />
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
            <OpportunityDetailsHeader
                selectedOpportunity={selectedOpportunity}
                opportunityCTAs={opportunityCTAs}
                opportunityConfig={opportunityConfig}
                opportunities={opportunities}
                selectCertainOpportunity={selectCertainOpportunity}
                totalCount={totalCount}
                allowedOpportunityIds={allowedOpportunityIds}
                onOpenDismissModal={handleOpenDismissModal}
            />

            <OpportunityDetailsContent
                selectedOpportunity={selectedOpportunity}
                opportunityConfig={opportunityConfig}
                onTicketCountClick={handleOpenTicketDrillDownModal}
                onFormValuesChange={handleFormValuesChange}
            />

            <DismissOpportunityModal
                isOpen={isDismissModalOpen}
                opportunity={selectedOpportunity}
                onClose={handleCancelDismiss}
                onConfirm={handleConfirmDismiss}
                onOpportunityDismissed={
                    opportunityConfig.onOpportunityDismissed
                }
            />

            {selectedOpportunity?.detectionObjectIds && (
                <OpportunityTicketDrillDownModal
                    isOpen={isTicketDrillDownModalOpen}
                    onClose={handleCloseTicketDrillDownModal}
                    ticketIds={selectedOpportunity.detectionObjectIds}
                />
            )}

            <UnsavedChangesPrompt
                onSave={handleSaveChanges}
                when={!!isFormDirty && !opportunityCTAs.isProcessing}
                onDiscard={handleResetForm}
                shouldRedirectAfterSave
                title={unsavedChangesPromptProps.title}
                body={unsavedChangesPromptProps.body}
                primaryCtaText={unsavedChangesPromptProps.primaryCtaText}
            />
        </div>
    )
}
