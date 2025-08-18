import { useEffect, useState } from 'react'

import { Opportunity } from '../../utils/mapAiArticlesToOpportunities'
import { OpportunityCard } from '../OpportunityCard/OpportunityCard'
import { OpportunityCardSkeleton } from '../OpportunityCardSkeleton/OpportunityCardSkeleton'

import css from './OpportunitiesSidebar.less'

interface OpportunitiesSidebarProps {
    opportunities: Opportunity[]
    isLoading?: boolean
    onSelectOpportunity: (opportunity: Opportunity | null) => void
}

export const OpportunitiesSidebar = ({
    opportunities,
    isLoading = false,
    onSelectOpportunity,
}: OpportunitiesSidebarProps) => {
    const [selectedCard, setSelectedCard] = useState<string | null>(
        opportunities.length > 0 ? opportunities[0].id : null,
    )

    useEffect(() => {
        if (opportunities.length > 0) {
            const initialOpportunity = opportunities[0]
            setSelectedCard(initialOpportunity.id)
            onSelectOpportunity(initialOpportunity)
        }
    }, [opportunities, onSelectOpportunity])

    const handleSelectCard = (opportunityId: string) => {
        setSelectedCard(opportunityId)
        const opportunity = opportunities.find(
            (opp) => opp.id === opportunityId,
        )
        if (opportunity) {
            onSelectOpportunity(opportunity)
        }
    }

    const itemCount = isLoading ? 0 : opportunities.length
    const itemCountText = itemCount === 1 ? '1 item' : `${itemCount} items`

    return (
        <div className={css.sidebar}>
            <div className={css.header}>
                <h3 className={css.title}>Opportunities</h3>
            </div>
            <div className={css.containerContent}>
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
                                selected={selectedCard === opportunity.id}
                                onSelect={() =>
                                    handleSelectCard(opportunity.id)
                                }
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
