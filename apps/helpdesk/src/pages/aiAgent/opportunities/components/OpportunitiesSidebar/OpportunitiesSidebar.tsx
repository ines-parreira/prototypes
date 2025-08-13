import { useEffect, useMemo, useState } from 'react'

import { OpportunityType } from '../../enums'
import { Opportunity } from '../OpportunitiesLayout/OpportunitiesLayout'
import { OpportunityCard } from '../OpportunityCard/OpportunityCard'

import css from './OpportunitiesSidebar.less'

interface OpportunitiesSidebarProps {
    onSelectOpportunity: (opportunity: Opportunity | null) => void
}

export const OpportunitiesSidebar = ({
    onSelectOpportunity,
}: OpportunitiesSidebarProps) => {
    // Mock data - replace with actual data source
    const opportunities = useMemo(
        () => [
            {
                id: '1',
                title: "What's your return policy?",
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
            },
            {
                id: '2',
                title: 'How do I access my store account?',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
            },
            {
                id: '3',
                title: 'How can I apply a discount?',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
            },
            {
                id: '4',
                title: 'Topic',
                type: OpportunityType.RESOLVE_CONFLICT,
            },
        ],
        [],
    )

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

    return (
        <div className={css.sidebar}>
            <div className={css.header}>
                <h3 className={css.title}>Available opportunities</h3>
            </div>
            <div className={css.containerContent}>
                {opportunities.length === 0 ? (
                    <div className={css.emptyState}>0 items</div>
                ) : (
                    <>
                        <div className={css.itemCount}>
                            {opportunities.length} items
                        </div>
                        <div className={css.cardsContainer}>
                            {opportunities.map((opportunity) => (
                                <OpportunityCard
                                    key={opportunity.id}
                                    title={opportunity.title}
                                    type={opportunity.type}
                                    selected={selectedCard === opportunity.id}
                                    onSelect={() =>
                                        handleSelectCard(opportunity.id)
                                    }
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
