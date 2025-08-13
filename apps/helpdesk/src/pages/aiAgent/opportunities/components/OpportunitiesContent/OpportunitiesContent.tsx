import { OpportunitiesEmptyState } from '../OpportunitiesEmptyState/OpportunitiesEmptyState'
import { Opportunity } from '../OpportunitiesLayout/OpportunitiesLayout'
import { OpportunityDetailsCard } from '../OpportunityDetailsCard/OpportunityDetailsCard'

import css from './OpportunitiesContent.less'

interface OpportunitiesContentProps {
    selectedOpportunity: Opportunity | null
}

export const OpportunitiesContent = ({
    selectedOpportunity,
}: OpportunitiesContentProps) => {
    return (
        <div className={css.containerContent}>
            <div className={css.header}>
                <h3 className={css.title}>Opportunities</h3>
            </div>
            <div className={css.contentBody}>
                {selectedOpportunity ? (
                    <OpportunityDetailsCard
                        type={selectedOpportunity.type}
                        title={selectedOpportunity.title}
                    />
                ) : (
                    <OpportunitiesEmptyState />
                )}
            </div>
        </div>
    )
}
