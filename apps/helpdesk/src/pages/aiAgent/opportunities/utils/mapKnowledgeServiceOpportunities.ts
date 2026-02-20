import type { PaginatedOpportunities } from '@gorgias/knowledge-service-types'

import { OpportunityType } from '../enums'
import type { OpportunityListItem } from '../types'
import { capitalizeFirstLetter } from './capitalizeFirstLetter'

/**
 * Maps Knowledge Service paginated opportunities to OpportunityListItem[].
 * Used for displaying in the sidebar.
 * Note: Does not include title or content - those are fetched separately via single opportunity endpoint.
 */
export const mapKnowledgeServiceOpportunities = (
    response: PaginatedOpportunities,
): OpportunityListItem[] => {
    return response.data.map((item) => {
        return {
            id: item.id.toString(),
            key: `ks_${item.id}`,
            type:
                item.opportunityType === 'FILL_KNOWLEDGE_GAP'
                    ? OpportunityType.FILL_KNOWLEDGE_GAP
                    : OpportunityType.RESOLVE_CONFLICT,
            ticketCount: item.detectionCount,
            insight: capitalizeFirstLetter(item.insight),
        }
    })
}
