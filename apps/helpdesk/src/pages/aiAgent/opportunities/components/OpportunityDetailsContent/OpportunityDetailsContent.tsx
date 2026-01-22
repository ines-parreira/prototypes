import { OpportunityType } from '../../enums'
import type { Opportunity, OpportunityConfig } from '../../types'
import { OpportunityDetailsCard } from '../OpportunityDetailsCard/OpportunityDetailsCard'
import { OpportunityGuidanceEditor } from '../OpportunityGuidanceEditor/OpportunityGuidanceEditor'
import type { GuidanceFormFields } from '../OpportunityGuidanceEditor/OpportunityGuidanceEditor'

import css from './OpportunityDetailsContent.less'

interface OpportunityDetailsContentProps {
    selectedOpportunity: Opportunity
    opportunityConfig: OpportunityConfig
    onTicketCountClick: () => void
    onFormValuesChange: (fields: GuidanceFormFields) => void
}

export const OpportunityDetailsContent = ({
    selectedOpportunity,
    opportunityConfig,
    onTicketCountClick,
    onFormValuesChange,
}: OpportunityDetailsContentProps) => {
    // TODO: Add content for knowledge conflicts
    if (selectedOpportunity.type === OpportunityType.RESOLVE_CONFLICT) {
        return null
    }

    return (
        <div className={css.contentBody}>
            <div className={css.opportunityDetails}>
                <OpportunityDetailsCard
                    type={selectedOpportunity.type}
                    ticketCount={selectedOpportunity.ticketCount}
                    onTicketCountClick={onTicketCountClick}
                />
                <OpportunityGuidanceEditor
                    key={selectedOpportunity.key}
                    opportunity={selectedOpportunity}
                    shopName={opportunityConfig.shopName}
                    onValuesChange={onFormValuesChange}
                    isInGuidanceEditorModeOnly
                />
            </div>
        </div>
    )
}
