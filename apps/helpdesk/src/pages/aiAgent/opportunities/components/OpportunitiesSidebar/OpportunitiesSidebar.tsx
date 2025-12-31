import { useCallback, useEffect, useMemo, useRef } from 'react'

import { Virtuoso } from 'react-virtuoso'

import { Button, Heading, Text } from '@gorgias/axiom'

import { OPPORTUNITY_CARD_HEIGHT } from '../../constants'
import { OPPORTUNITIES_PAGE_SIZE } from '../../hooks/useKnowledgeServiceOpportunities'
import { useOpportunitiesSidebar } from '../../hooks/useOpportunitiesSidebar'
import type { Opportunity, SidebarOpportunityItem } from '../../types'
import { getOpportunitySidebarDisplayText } from '../../types'
import { checkAndTriggerAutoFetch } from '../../utils/autoFetchScrollChecker'
import { OpportunityCard } from '../OpportunityCard/OpportunityCard'
import { OpportunityCardSkeleton } from '../OpportunityCardSkeleton/OpportunityCardSkeleton'

import css from './OpportunitiesSidebar.less'

interface OpportunitiesSidebarProps {
    opportunities: SidebarOpportunityItem[]
    isLoading?: boolean
    onSelectOpportunity: (opportunity: SidebarOpportunityItem | null) => void
    selectedOpportunity?: Opportunity | null
    onOpportunityViewed?: (context: {
        opportunityId: string
        opportunityType: string
    }) => void
    hasNextPage?: boolean
    isFetchingNextPage?: boolean
    onEndReached?: () => void
    totalCount?: number
    totalPending?: number
}

export const OpportunitiesSidebar = ({
    opportunities,
    isLoading = false,
    onSelectOpportunity,
    selectedOpportunity,
    onOpportunityViewed,
    hasNextPage = false,
    isFetchingNextPage = false,
    onEndReached,
    totalCount,
    totalPending,
}: OpportunitiesSidebarProps) => {
    const virtuosoContainerRef = useRef<HTMLDivElement>(null)
    const onEndReachedRef = useRef(onEndReached)
    const { setIsSidebarVisible } = useOpportunitiesSidebar()

    const handleToggleSidebar = useCallback(() => {
        setIsSidebarVisible(false)
    }, [setIsSidebarVisible])

    useEffect(() => {
        onEndReachedRef.current = onEndReached
    }, [onEndReached])

    useEffect(() => {
        if (selectedOpportunity) {
            onOpportunityViewed?.({
                opportunityId: selectedOpportunity.id,
                opportunityType: selectedOpportunity.type,
            })
        }
    }, [onOpportunityViewed, selectedOpportunity])

    // we need this in case the first page is fully rendered and the content is not scrollable yet
    // the virtuoso component does not trigger the endReached event in this case
    useEffect(() => {
        if (
            !isLoading &&
            !isFetchingNextPage &&
            hasNextPage &&
            onEndReachedRef.current &&
            virtuosoContainerRef.current
        ) {
            const timeoutId = setTimeout(() => {
                const threshold = OPPORTUNITY_CARD_HEIGHT * 2
                checkAndTriggerAutoFetch(
                    virtuosoContainerRef.current,
                    threshold,
                    hasNextPage,
                    isFetchingNextPage,
                    onEndReachedRef.current,
                )
            }, 100)
            return () => clearTimeout(timeoutId)
        }
    }, [opportunities.length, isLoading, isFetchingNextPage, hasNextPage])

    const handleSelectCard = useCallback(
        (opportunityId: string) => {
            const opportunity = opportunities.find(
                (opp) => opp.id === opportunityId,
            )
            if (opportunity) {
                onSelectOpportunity(opportunity)
            }
        },
        [opportunities, onSelectOpportunity],
    )

    const itemCount = isLoading ? 0 : opportunities.length
    const itemCountText = itemCount === 1 ? '1 item' : `${itemCount} items`

    const showNoOpportunitiesYet =
        !isLoading && totalCount !== undefined && totalCount === 0
    const showAllOpportunitiesReviewed =
        !isLoading &&
        totalCount !== undefined &&
        totalPending !== undefined &&
        totalCount > 0 &&
        totalPending === 0
    const showLegacyEmptyState =
        !isLoading &&
        totalCount === undefined &&
        totalPending === undefined &&
        opportunities.length === 0

    const renderOpportunityCard = useCallback(
        (_index: number, opportunity: SidebarOpportunityItem) => {
            return (
                <OpportunityCard
                    title={getOpportunitySidebarDisplayText(opportunity)}
                    type={opportunity.type}
                    ticketCount={opportunity.ticketCount}
                    selected={selectedOpportunity?.id === opportunity.id}
                    onSelect={() => handleSelectCard(opportunity.id)}
                />
            )
        },
        [selectedOpportunity?.id, handleSelectCard],
    )

    const handleEndReached = useCallback(() => {
        if (hasNextPage && onEndReached) {
            onEndReached()
        }
    }, [hasNextPage, onEndReached])

    const renderFooter = useCallback(() => {
        if (isFetchingNextPage) {
            return (
                <>
                    {Array.from({ length: OPPORTUNITIES_PAGE_SIZE }).map(
                        (_, index) => (
                            <OpportunityCardSkeleton
                                key={`skeleton-${index}`}
                            />
                        ),
                    )}
                </>
            )
        }
        return null
    }, [isFetchingNextPage])

    const virtuosoComponents = useMemo(
        () => ({
            Footer: renderFooter,
        }),
        [renderFooter],
    )

    return (
        <div className={css.sidebar}>
            <div className={css.header}>
                <Button
                    intent="regular"
                    variant="secondary"
                    icon="system-bar-left"
                    size="sm"
                    onClick={handleToggleSidebar}
                    aria-label="Hide sidebar"
                />
                <Heading size="sm">Opportunities</Heading>
            </div>
            <div className={css.containerContent}>
                {showNoOpportunitiesYet ? (
                    <div className={css.emptyState}>
                        <h3 className={css.title}>No opportunities yet</h3>
                        <p className={css.description}>
                            AI Agent will start finding opportunities to improve
                            as it learns from conversations with your customers
                        </p>
                    </div>
                ) : showAllOpportunitiesReviewed ? (
                    <div className={css.emptyState}>
                        <h3 className={css.title}>
                            You&apos;ve reviewed all opportunities
                        </h3>
                        <p className={css.description}>
                            Check back soon for new opportunities to improve AI
                            Agent&apos;s knowledge and performance
                        </p>
                    </div>
                ) : showLegacyEmptyState ? (
                    <div className={css.emptyState}>
                        <h3 className={css.title}>No opportunities yet</h3>
                        <p className={css.description}>
                            AI Agent will start finding opportunities to improve
                            as it learns from conversations with your customers
                        </p>
                    </div>
                ) : (
                    <>
                        <div className={css.itemCountContainer}>
                            <Text size="sm" variant="regular">
                                {itemCountText}
                            </Text>
                        </div>
                        {isLoading ? (
                            <div className={css.cardsContainer}>
                                {Array.from({
                                    length: OPPORTUNITIES_PAGE_SIZE,
                                }).map((_, index) => (
                                    <OpportunityCardSkeleton
                                        key={`loading-skeleton-${index}`}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div
                                className={css.virtuosoContainer}
                                ref={virtuosoContainerRef}
                            >
                                <Virtuoso
                                    data={opportunities}
                                    itemContent={renderOpportunityCard}
                                    computeItemKey={(_index, opportunity) =>
                                        opportunity.id
                                    }
                                    endReached={handleEndReached}
                                    atBottomThreshold={
                                        OPPORTUNITY_CARD_HEIGHT * 2
                                    }
                                    fixedItemHeight={OPPORTUNITY_CARD_HEIGHT}
                                    components={virtuosoComponents}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
