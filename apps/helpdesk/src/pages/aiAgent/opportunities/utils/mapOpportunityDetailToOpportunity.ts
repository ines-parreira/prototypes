import type {
    ConflictOpportunityDetail,
    FindOpportunityByIdForShopOpportunity200,
    KnowledgeGapOpportunityDetail,
} from '@gorgias/knowledge-service-types'

import { OpportunityType } from '../enums'
import type { Opportunity, OpportunityResource } from '../types'
import { ResourceType } from '../types'

/**
 * Maps knowledge service resource type to internal ResourceType enum
 */
const mapResourceType = (type: string): ResourceType => {
    switch (type) {
        case 'guidance':
            return ResourceType.GUIDANCE
        case 'article':
            return ResourceType.ARTICLE
        case 'external_snippet':
            return ResourceType.EXTERNAL_SNIPPET
        default:
            return ResourceType.GUIDANCE
    }
}

/**
 * Maps a single opportunity detail response to an Opportunity object.
 * Used for displaying in the content area.
 */
export const mapOpportunityDetailToOpportunity = (
    detail: FindOpportunityByIdForShopOpportunity200,
): Opportunity => {
    const baseOpportunity = {
        id: detail.id.toString(),
        key: `ks_${detail.id}`,
    }

    if (detail.opportunityType === 'FILL_KNOWLEDGE_GAP') {
        const knowledgeGap = detail as KnowledgeGapOpportunityDetail
        const knowledgeResource = knowledgeGap.knowledgeResource

        const resources: OpportunityResource[] = knowledgeResource
            ? [
                  {
                      title: knowledgeResource.title || 'Untitled',
                      content: knowledgeResource.body || '',
                      type: mapResourceType(knowledgeResource.type),
                      isVisible: true,
                  },
              ]
            : []

        return {
            ...baseOpportunity,
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            ticketCount: knowledgeGap.detectionCount,
            detectionObjectIds: knowledgeGap.detectionObjectIds,
            resources,
        }
    }

    const conflict = detail as ConflictOpportunityDetail

    const resources: OpportunityResource[] = conflict.conflictingResources.map(
        (conflictingResource, index) => {
            const resourceMeta = conflict.resources[index]

            return {
                title: conflictingResource.title || 'Untitled',
                content: conflictingResource.body || '',
                insight: resourceMeta?.insight || '',
                type: mapResourceType(conflictingResource.type),
                isVisible: true,
                identifiers: resourceMeta
                    ? {
                          resourceId: resourceMeta.resourceId,
                          resourceSetId: resourceMeta.resourceSetId,
                          resourceLocale: resourceMeta.resourceLocale,
                          resourceVersion: resourceMeta.resourceVersion,
                      }
                    : undefined,
            }
        },
    )

    return {
        ...baseOpportunity,
        type: OpportunityType.RESOLVE_CONFLICT,
        detectionObjectIds: conflict.detectionObjectIds,
        resources,
    }
}
