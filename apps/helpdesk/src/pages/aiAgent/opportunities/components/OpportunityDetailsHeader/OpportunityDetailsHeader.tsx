import { useCallback, useLayoutEffect, useRef, useState } from 'react'

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
}: OpportunityDetailsHeaderProps) => {
    const [containerWidth, setContainerWidth] = useState(0)
    const approveButtonRef = useRef<HTMLButtonElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)

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

    const isApproveDisabled =
        isKnowledgeGap &&
        (isLoadingGuidanceCount || guidanceCount >= MAX_GUIDANCES)

    const shouldShowMaxGuidancesTooltip =
        isKnowledgeGap &&
        !isLoadingGuidanceCount &&
        guidanceCount >= MAX_GUIDANCES

    useLayoutEffect(() => {
        if (!headerRef.current) return

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width)
            }
        })

        resizeObserver.observe(headerRef.current)

        return () => {
            resizeObserver.disconnect()
        }
    }, [])

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
        const resourceTitle = selectedOpportunity.resources[0]?.title
        const titleText = `${typeLabel}: ${resourceTitle}`

        return (
            <Heading size="md" className={css.title}>
                <TruncatedTextWithTooltip tooltipContent={titleText}>
                    {titleText}
                </TruncatedTextWithTooltip>
            </Heading>
        )
    }

    return (
        <div className={css.header} ref={headerRef}>
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
                        selectCertainOpportunity={selectCertainOpportunity}
                        totalCount={totalCount}
                        allowedOpportunityIds={allowedOpportunityIds}
                        hideCount={containerWidth < 582}
                    />
                    <div className={css.headerActionDelimiter} />
                    <Button variant="tertiary" onClick={onOpenDismissModal}>
                        Dismiss
                    </Button>

                    {isResolveConflict && (
                        <Button
                            variant="primary"
                            leadingSlot="check"
                            onClick={handleResolve}
                            isLoading={isProcessing}
                            isDisabled={!isFormDirty}
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
                                        isDisabled={isApproveDisabled}
                                    >
                                        Publish and enable
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
                                        enabled. To publish and enable this
                                        Guidance, disable an existing one.
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <Button
                                variant="primary"
                                leadingSlot="check"
                                onClick={handleApprove}
                                isLoading={isProcessing}
                                isDisabled={isApproveDisabled}
                            >
                                Publish and enable
                            </Button>
                        ))}
                </div>
            )}
        </div>
    )
}
