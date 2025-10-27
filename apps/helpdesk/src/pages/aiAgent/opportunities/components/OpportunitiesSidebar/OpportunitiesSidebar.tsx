import { useEffect } from 'react'

import { LegacyButton as Button, LoadingSpinner } from '@gorgias/axiom'

import { Opportunity } from '../../utils/mapAiArticlesToOpportunities'
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
    onLoadMore?: () => void
}

export const OpportunitiesSidebar = ({
    opportunities,
    isLoading = false,
    onSelectOpportunity,
    selectedOpportunity,
    onOpportunityViewed,
    hasNextPage = false,
    isFetchingNextPage = false,
    onLoadMore,
}: OpportunitiesSidebarProps) => {
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

    const handleSelectCard = (opportunityId: string) => {
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
    }

    const itemCount = isLoading ? 0 : opportunities.length
    const itemCountText = itemCount === 1 ? '1 item' : `${itemCount} items`

    const showEmptyState = !isLoading && opportunities.length === 0

    return (
        <div className={css.sidebar}>
            <div className={css.header}>
                <h3 className={css.title}>Opportunities</h3>
            </div>
            <div className={css.containerContent}>
                {showEmptyState ? (
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
                        <div className={css.cardsContainer}>
                            {isLoading ? (
                                <>
                                    <OpportunityCardSkeleton />
                                    <OpportunityCardSkeleton />
                                    <OpportunityCardSkeleton />
                                </>
                            ) : (
                                <>
                                    {opportunities.map((opportunity) => (
                                        <OpportunityCard
                                            key={opportunity.id}
                                            title={opportunity.title}
                                            type={opportunity.type}
                                            ticketCount={
                                                opportunity.ticketCount
                                            }
                                            selected={
                                                selectedOpportunity?.id ===
                                                opportunity.id
                                            }
                                            onSelect={() =>
                                                handleSelectCard(opportunity.id)
                                            }
                                        />
                                    ))}
                                    {hasNextPage && onLoadMore && (
                                        <div className={css.loadMoreContainer}>
                                            <Button
                                                intent="secondary"
                                                fillStyle="ghost"
                                                onClick={onLoadMore}
                                                isLoading={isFetchingNextPage}
                                                className={css.loadMoreButton}
                                            >
                                                {isFetchingNextPage
                                                    ? 'Loading...'
                                                    : 'Load More'}
                                            </Button>
                                        </div>
                                    )}
                                    {isFetchingNextPage && !hasNextPage && (
                                        <div className={css.loadMoreContainer}>
                                            <LoadingSpinner size="small" />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
