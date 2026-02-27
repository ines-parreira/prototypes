import { useCallback, useEffect, useState } from 'react'

import { Skeleton } from '@gorgias/axiom'
import type { FeedbackMutation } from '@gorgias/knowledge-service-types'

import { DeleteOpportunityModal } from 'pages/aiAgent/opportunities/components/DeleteOpportunityModal/DeleteOpportunityModal'
import { DismissOpportunityModal } from 'pages/aiAgent/opportunities/components/DismissOpportunityModal/DismissOpportunityModal'
import { OpportunityDetailsHeader } from 'pages/aiAgent/opportunities/components/OpportunityDetailsHeader/OpportunityDetailsHeader'
import { OpportunitySidebarButton } from 'pages/aiAgent/opportunities/components/OpportunitySidebarButton/OpportunitySidebarButton'
import { State } from 'pages/aiAgent/opportunities/hooks/useOpportunityPageState'
import type { OpportunityPageState } from 'pages/aiAgent/opportunities/hooks/useOpportunityPageState'
import type {
    Opportunity,
    SidebarOpportunityItem,
} from 'pages/aiAgent/opportunities/types'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import { normalizeHtml } from 'utils/html'

import { OpportunityType } from '../../enums'
import { useOpportunityCTAs } from '../../hooks/useOpportunityCTAs'
import type { OpportunityConfig, ResourceFormFields } from '../../types'
import { OpportunitiesContentSkeleton } from '../OpportunitiesContentSkeleton/OpportunitiesContentSkeleton'
import { OpportunitiesEmptyState } from '../OpportunitiesEmptyState/OpportunitiesEmptyState'
import { OpportunityDetailsContent } from '../OpportunityDetailsContent/OpportunityDetailsContent'
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
    stateConfig: Record<State, OpportunityPageState>
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
    stateConfig,
}: OpportunitiesContentProps) => {
    const [isDismissModalOpen, setIsDismissModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isTicketDrillDownModalOpen, setIsTicketDrillDownModalOpen] =
        useState(false)

    const [editorFormResources, setEditorFormResources] = useState<
        ResourceFormFields[]
    >([])

    /**
     * editorResetKey is used to force remount OpportunityDetailsContent and its child editors.
     *
     * It was necessary here because the editors are display-only components based on parent data.
     * When a user marks a resource as deleted (isDeleted: true) and then cancels the DeleteModal, we need to
     * reset the editor state. Without remounting, the editors continue sending isDeleted: true
     * in onFormValuesChange callbacks, causing stale state issues.
     *
     * Alternative approaches considered:
     * - Lifting state management: Would require significant refactoring of the editor components
     * - Imperative reset methods: Would conflict with React's declarative paradigm and add complexity
     * - useEffect to sync state: Would create additional re-renders and potential race conditions
     *
     * The key remounting pattern is the simplest solution for this edge case scenario.
     */
    const [editorResetKey, setEditorResetKey] = useState(0)

    const opportunityCTAs = useOpportunityCTAs({
        selectedOpportunity,
        editorFormResources,
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

    const handleConfirmDelete = useCallback(async () => {
        await opportunityCTAs.handleResolve()
        setIsDeleteModalOpen(false)
    }, [opportunityCTAs])

    const handleCancelDelete = useCallback(() => {
        setEditorFormResources((prev) =>
            prev.map((resource) => ({
                ...resource,
                isDeleted: false,
            })),
        )
        setEditorResetKey((prev) => prev + 1)
        setIsDeleteModalOpen(false)
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
        (resourceIndex: number, fields: ResourceFormFields) => {
            setEditorFormResources((prev) => {
                const updated = [...prev]
                updated[resourceIndex] = fields
                return updated
            })

            if (fields.isDeleted) {
                setIsDeleteModalOpen(true)
            }
        },
        [],
    )

    useEffect(() => {
        if (selectedOpportunity) {
            setEditorFormResources(
                selectedOpportunity.resources.map((resource) => ({
                    title: resource.title,
                    content: resource.content,
                    isVisible: resource.isVisible,
                    isDeleted: false,
                })),
            )
        }
    }, [selectedOpportunity])

    const isFormDirty =
        selectedOpportunity &&
        editorFormResources.some((resource, index) => {
            const originalResource = selectedOpportunity.resources[index]
            return (
                resource.title.trim() !== originalResource?.title.trim() ||
                normalizeHtml(resource.content) !==
                    normalizeHtml(originalResource?.content || '') ||
                resource.isVisible !== originalResource?.isVisible
            )
        })

    const isFormValid = editorFormResources.every(
        (resource) =>
            resource.title.trim() !== '' && resource.content.trim() !== '',
    )

    const handleSaveChanges = useCallback(async () => {
        if (!selectedOpportunity) return

        if (selectedOpportunity.type === OpportunityType.RESOLVE_CONFLICT) {
            return opportunityCTAs.handleResolve()
        }
        return opportunityCTAs.handleApprove()
    }, [selectedOpportunity, opportunityCTAs])

    const handleResetForm = useCallback(() => {
        if (selectedOpportunity) {
            setEditorFormResources(
                selectedOpportunity.resources.map((resource) => ({
                    title: resource.title,
                    content: resource.content,
                    isVisible: resource.isVisible,
                    isDeleted: false,
                })),
            )
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
            title: 'Resolve?',
            body: "Your changes will be lost if you navigate elsewhere and don't acknowledge this gap.",
            primaryCtaText: 'Resolve',
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
                <div className={css.header}>
                    <OpportunitySidebarButton />
                </div>
                <RestrictedOpportunityMessage
                    opportunitiesPageState={opportunitiesPageState}
                    shopName={opportunityConfig.shopName}
                />
            </div>
        )
    }

    if (opportunitiesPageState.showEmptyState) {
        return (
            <div className={css.containerContent}>
                <div className={css.header}>
                    <OpportunitySidebarButton />
                </div>
                <OpportunitiesEmptyState
                    opportunitiesPageState={opportunitiesPageState}
                />
            </div>
        )
    }

    if (!selectedOpportunity) {
        return (
            <div className={css.containerContent}>
                <div className={css.header}>
                    <OpportunitySidebarButton />
                </div>
                <OpportunitiesEmptyState
                    opportunitiesPageState={
                        stateConfig[State.OPPORTUNITY_NOT_FOUND]
                    }
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
                isFormDirty={!!isFormDirty}
                isFormValid={isFormValid}
            />

            <OpportunityDetailsContent
                key={editorResetKey}
                selectedOpportunity={selectedOpportunity}
                opportunityConfig={opportunityConfig}
                onTicketCountClick={handleOpenTicketDrillDownModal}
                onFormValuesChange={handleFormValuesChange}
                onOpportunityRemoved={opportunityCTAs.handleDismiss}
            />

            <DismissOpportunityModal
                isOpen={isDismissModalOpen}
                opportunity={selectedOpportunity}
                onClose={handleCancelDismiss}
                onConfirm={handleConfirmDismiss}
            />

            <DeleteOpportunityModal
                isOpen={isDeleteModalOpen}
                opportunity={selectedOpportunity}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
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
