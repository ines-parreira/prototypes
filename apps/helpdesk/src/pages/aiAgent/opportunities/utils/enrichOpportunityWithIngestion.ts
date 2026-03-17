import type { UseQueryResult } from '@tanstack/react-query'

import type { Components } from 'rest_api/help_center_api/client.generated'

import type { Opportunity, OpportunityResource } from '../types'
import { ResourceType } from '../types'

type ArticleWithIngestion = Components.Schemas.ArticleWithLocalTranslation & {
    ingested_resource?: Components.Schemas.IngestedResourceDto
}

/**
 * Enriches opportunity resources with article ingestion data.
 * For external_snippet resources, this adds the source and ingestion type
 * from the associated article's ingestion log.
 */
export const enrichOpportunityWithIngestion = (
    opportunity: Opportunity,
    articleQueries: UseQueryResult<ArticleWithIngestion | null>[],
): Opportunity => {
    const externalSnippetResources = opportunity.resources.filter(
        (resource) =>
            resource.type === ResourceType.EXTERNAL_SNIPPET &&
            resource.identifiers,
    )

    if (externalSnippetResources.length === 0) {
        return opportunity
    }

    const enrichedResources: OpportunityResource[] = opportunity.resources.map(
        (resource) => {
            if (
                resource.type !== ResourceType.EXTERNAL_SNIPPET ||
                !resource.identifiers
            ) {
                return resource
            }

            const articleQueryIndex = externalSnippetResources.findIndex(
                (r) =>
                    r.identifiers?.resourceId ===
                    resource.identifiers?.resourceId,
            )

            if (articleQueryIndex === -1) {
                return resource
            }

            const articleQuery = articleQueries[articleQueryIndex]

            if (!articleQuery.data) {
                return resource
            }

            const ingestedResource = articleQuery.data.ingested_resource
            const ingestionLog = ingestedResource?.article_ingestion_log

            if (!ingestionLog) {
                return resource
            }

            return {
                ...resource,
                meta: {
                    articleIngestionLog: ingestionLog,
                    executionId: ingestedResource.execution_id,
                },
            }
        },
    )

    return {
        ...opportunity,
        resources: enrichedResources,
    }
}
