import type { PaginatedOpportunities } from '@gorgias/knowledge-service-types'

import { OpportunityType } from '../enums'
import type { Opportunity } from './mapAiArticlesToOpportunities'

export const mapKnowledgeServiceOpportunities = (
    response: PaginatedOpportunities,
): Opportunity[] => {
    return response.data.map((item) => {
        const firstResource = item.resources[0]

        return {
            id: item.id.toString(),
            key: `ks_${item.id}`,
            title: firstResource?.resourceTitle || 'Untitled Opportunity',
            content: '', // we don't need to include the content in the opportunity as we will be fetching it separately when a single opportunity is selected
            type:
                item.opportunityType === 'FILL_KNOWLEDGE_GAP'
                    ? OpportunityType.FILL_KNOWLEDGE_GAP
                    : OpportunityType.RESOLVE_CONFLICT,
            ticketCount: item.detectionCount,
        }
    })
}
