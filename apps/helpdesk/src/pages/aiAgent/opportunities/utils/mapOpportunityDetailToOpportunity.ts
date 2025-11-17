import type {
    ConflictOpportunityDetail,
    FindOpportunityByIdOpportunity200,
    KnowledgeGapOpportunityDetail,
} from '@gorgias/knowledge-service-types'

import { OpportunityType } from '../enums'
import type { Opportunity } from './mapAiArticlesToOpportunities'

export const mapOpportunityDetailToOpportunity = (
    detail: FindOpportunityByIdOpportunity200,
): Opportunity => {
    const baseOpportunity = {
        id: detail.id.toString(),
        key: `ks_${detail.id}`,
    }

    if (detail.opportunityType === 'FILL_KNOWLEDGE_GAP') {
        const knowledgeGap = detail as KnowledgeGapOpportunityDetail
        return {
            ...baseOpportunity,
            title: knowledgeGap.knowledgeResource?.title || 'Untitled',
            content: knowledgeGap.knowledgeResource?.body || '',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            ticketCount: knowledgeGap.detectionCount,
            detectionObjectIds: knowledgeGap.detectionObjectIds,
        }
    }

    const conflict = detail as ConflictOpportunityDetail
    const firstConflictingResource = conflict.conflictingResources[0]
    return {
        ...baseOpportunity,
        title: firstConflictingResource?.title || 'Untitled',
        content: firstConflictingResource?.body || '',
        type: OpportunityType.RESOLVE_CONFLICT,
        detectionObjectIds: conflict.detectionObjectIds,
    }
}
