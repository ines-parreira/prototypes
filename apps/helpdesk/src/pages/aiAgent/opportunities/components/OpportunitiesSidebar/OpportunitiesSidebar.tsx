import { useEffect } from 'react'

import { Badge } from '@gorgias/axiom'

import { Opportunity } from '../../utils/mapAiArticlesToOpportunities'
import { OpportunityCard } from '../OpportunityCard/OpportunityCard'
import { OpportunityCardSkeleton } from '../OpportunityCardSkeleton/OpportunityCardSkeleton'

import css from './OpportunitiesSidebar.less'

interface OpportunitiesSidebarProps {
    opportunities: Opportunity[]
    isLoading?: boolean
    onSelectOpportunity: (opportunity: Opportunity | null) => void
    selectedOpportunity?: Opportunity | null
}

export const OpportunitiesSidebar = ({
    opportunities,
    isLoading = false,
    onSelectOpportunity,
    selectedOpportunity,
}: OpportunitiesSidebarProps) => {
    useEffect(() => {
        if (opportunities.length > 0) {
            const initialOpportunity = opportunities[0]
            onSelectOpportunity(initialOpportunity)
        }
    }, [opportunities, onSelectOpportunity])

    const handleSelectCard = (opportunityId: string) => {
        const opportunity = opportunities.find(
            (opp) => opp.id === opportunityId,
        )
        if (opportunity) {
            onSelectOpportunity(opportunity)
        }
    }

    const itemCount = isLoading ? 0 : opportunities.length
    const itemCountText = itemCount === 1 ? '1 item' : `${itemCount} items`

    const showEmptyState = !isLoading && opportunities.length === 0

    return (
        <div className={css.sidebar}>
            <div className={css.header}>
                <h3 className={css.title}>Opportunities</h3>
                <Badge className={css.badge} type={'blue'}>
                    NEW
                </Badge>
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
                                opportunities.map((opportunity) => (
                                    <OpportunityCard
                                        key={opportunity.id}
                                        title={opportunity.title}
                                        type={opportunity.type}
                                        selected={
                                            selectedOpportunity?.id ===
                                            opportunity.id
                                        }
                                        onSelect={() =>
                                            handleSelectCard(opportunity.id)
                                        }
                                    />
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
