import { useCallback, useRef } from 'react'

import {
    Button,
    Heading,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { TruncatedTextWithTooltip } from 'pages/aiAgent/KnowledgeHub/Table/TruncatedTextWithTooltip'

import { OpportunityType } from '../../enums'
import { useGuidanceCount } from '../../hooks/useGuidanceCount'
import { useOpportunitiesSidebar } from '../../hooks/useOpportunitiesSidebar'
import type { useOpportunityCTAs } from '../../hooks/useOpportunityCTAs'
import type {
    Opportunity,
    OpportunityConfig,
    SidebarOpportunityItem,
} from '../../types'
import { OpportunitiesNavigation } from '../OpportunitiesNavigation/OpportunitiesNavigation'

import css from './OpportunityDetailsHeader.less'

const MAX_GUIDANCES = 100

interface OpportunityDetailsHeaderProps {
    selectedOpportunity: Opportunity | null
    opportunityCTAs: ReturnType<typeof useOpportunityCTAs>
    opportunityConfig: OpportunityConfig
    opportunities?: SidebarOpportunityItem[]
    selectCertainOpportunity?: (index: number) => void
    totalCount: number
    allowedOpportunityIds?: number[]
    onOpenDismissModal: () => void
    isFormDirty?: boolean
    isFormValid?: boolean
}

export const OpportunityDetailsHeader = ({
    selectedOpportunity,
    opportunityCTAs,
    opportunityConfig,
    opportunities,
    selectCertainOpportunity,
    totalCount,
    allowedOpportunityIds,
    onOpenDismissModal,
    isFormDirty = false,
    isFormValid = true,
}: OpportunityDetailsHeaderProps) => {
    const approveButtonRef = useRef<HTMLButtonElement>(null)

    const { isSidebarVisible, setIsSidebarVisible } = useOpportunitiesSidebar()

    const { handleApprove, handleResolve, isProcessing } = opportunityCTAs

    const { guidanceCount, isLoading: isLoadingGuidanceCount } =
        useGuidanceCount({
            guidanceHelpCenterId: opportunityConfig.guidanceHelpCenterId,
            shopName: opportunityConfig.shopName,
        })

    const { routes } = useAiAgentNavigation({
        shopName: opportunityConfig.shopName,
    })

    const guidanceRouteUrl = routes.guidance

    const isKnowledgeGap =
        selectedOpportunity?.type === OpportunityType.FILL_KNOWLEDGE_GAP
    const isResolveConflict =
        selectedOpportunity?.type === OpportunityType.RESOLVE_CONFLICT

    const isRelevant = selectedOpportunity?.isRelevant !== false

    const isApproveDisabled =
        isKnowledgeGap &&
        (isLoadingGuidanceCount || guidanceCount >= MAX_GUIDANCES)

    const shouldShowMaxGuidancesTooltip =
        isKnowledgeGap &&
        !isLoadingGuidanceCount &&
        guidanceCount >= MAX_GUIDANCES

    const handleShowSidebar = useCallback(() => {
        setIsSidebarVisible(true)
    }, [setIsSidebarVisible])

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
        if (!selectedOpportunity) return null

        const typeLabel = getOpportunityTypeLabel(selectedOpportunity.type)
        const titleText = `${typeLabel}: ${selectedOpportunity.insight}`

        return (
            <Heading size="md" className={css.title}>
                <TruncatedTextWithTooltip tooltipContent={titleText}>
                    {titleText}
                </TruncatedTextWithTooltip>
            </Heading>
        )
    }

    return (
        <div className={css.header}>
            <div className={css.headerLeft}>
                {!isSidebarVisible && (
                    <Button
                        intent="regular"
                        variant="secondary"
                        icon="system-bar-left"
                        size="sm"
                        onClick={handleShowSidebar}
                        aria-label="Show sidebar"
                        className={css.sidebarButton}
                    />
                )}
                <SelectedOpportunityTitle />
            </div>
            {selectedOpportunity && (
                <div className={css.headerActions}>
                    <OpportunitiesNavigation
                        opportunities={opportunities}
                        selectedOpportunity={selectedOpportunity}
                        selectCertainOpportunity={selectCertainOpportunity}
                        totalCount={totalCount}
                        allowedOpportunityIds={allowedOpportunityIds}
                    />
                    <div className={css.headerActionDelimiter} />
                    <Button
                        variant="secondary"
                        onClick={onOpenDismissModal}
                        isDisabled={!isRelevant}
                    >
                        Dismiss
                    </Button>

                    {isResolveConflict && (
                        <Button
                            variant="primary"
                            leadingSlot="check"
                            onClick={handleResolve}
                            isLoading={isProcessing}
                            isDisabled={
                                !isFormDirty || !isFormValid || !isRelevant
                            }
                        >
                            Resolve
                        </Button>
                    )}

                    {isKnowledgeGap &&
                        (shouldShowMaxGuidancesTooltip ? (
                            <Tooltip placement="top">
                                <TooltipTrigger>
                                    <Button
                                        ref={approveButtonRef}
                                        variant="primary"
                                        leadingSlot="check"
                                        onClick={handleApprove}
                                        isLoading={isProcessing}
                                        isDisabled={
                                            isApproveDisabled ||
                                            !isRelevant ||
                                            !isFormValid
                                        }
                                    >
                                        Mark as done
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div>
                                        You currently have {MAX_GUIDANCES}{' '}
                                        <a
                                            href={guidanceRouteUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={css.guidanceLink}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            Guidance
                                        </a>{' '}
                                        enabled. To acknowledge this gap,
                                        disable an existing one.
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <Button
                                variant="primary"
                                leadingSlot="check"
                                onClick={handleApprove}
                                isLoading={isProcessing}
                                isDisabled={
                                    isApproveDisabled ||
                                    !isRelevant ||
                                    !isFormValid
                                }
                            >
                                Mark as done
                            </Button>
                        ))}
                </div>
            )}
        </div>
    )
}
