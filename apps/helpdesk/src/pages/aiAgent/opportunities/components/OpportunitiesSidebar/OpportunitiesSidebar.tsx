import { useCallback, useEffect, useMemo, useRef } from 'react'

import { Virtuoso } from 'react-virtuoso'

import { OPPORTUNITY_CARD_HEIGHT } from '../../constants'
import { OPPORTUNITIES_PAGE_SIZE } from '../../hooks/useKnowledgeServiceOpportunities'
import { checkAndTriggerAutoFetch } from '../../utils/autoFetchScrollChecker'
import type { Opportunity } from '../../utils/mapAiArticlesToOpportunities'
import { OpportunityCard } from '../OpportunityCard/OpportunityCard'
import { OpportunityCardSkeleton } from '../OpportunityCardSkeleton/OpportunityCardSkeleton'

import css from './OpportunitiesSidebar.less'

interface OpportunitiesSidebarProps {
    opportunities: Opportunity[]
    isLoading?: boolean
    onSelectOpportunity: (opportunity: Opportunity | null) => void
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

    useEffect(() => {
        onEndReachedRef.current = onEndReached
    }, [onEndReached])

    useEffect(() => {
        if (opportunities.length > 0 && !selectedOpportunity) {
            const initialOpportunity = opportunities[0]
            onSelectOpportunity(initialOpportunity)
            onOpportunityViewed?.({
                opportunityId: initialOpportunity.id,
                opportunityType: initialOpportunity.type,
            })
        }
    }, [
        opportunities,
        onSelectOpportunity,
        onOpportunityViewed,
        selectedOpportunity,
    ])

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
                onOpportunityViewed?.({
                    opportunityId: opportunity.id,
                    opportunityType: opportunity.type,
                })
            }
        },
        [opportunities, onSelectOpportunity, onOpportunityViewed],
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
        (_index: number, opportunity: Opportunity) => {
            return (
                <OpportunityCard
                    title={opportunity.title}
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
                <h3 className={css.title}>Opportunities</h3>
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
                        <div className={css.itemCount}>{itemCountText}</div>
                        {isLoading ? (
                            <div className={css.cardsContainer}>
                                {Array.from({
                                    length: OPPORTUNITIES_PAGE_SIZE,
                                }).map((_, index) => (
                                    <OpportunityCardSkeleton
                                        key={`loading-skeleton-${index}`}
                                        cardContainerClassName={
                                            index === 0 &&
                                            opportunities.length === 0
                                                ? css.skeletonCard
                                                : undefined
                                        }
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
