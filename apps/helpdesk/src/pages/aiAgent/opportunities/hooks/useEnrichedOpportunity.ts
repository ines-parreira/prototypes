import { useMemo } from 'react'

import { useQueries } from '@tanstack/react-query'

import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import type {
    Components,
    Paths,
} from 'rest_api/help_center_api/client.generated'

import { ResourceType } from '../types'
import { enrichOpportunityWithIngestion } from '../utils/enrichOpportunityWithIngestion'
import { useFindOneOpportunity } from './useFindOneOpportunity'

type ArticleWithIngestion = Components.Schemas.ArticleWithLocalTranslation & {
    ingested_resource?: Components.Schemas.IngestedResourceDto
}

/**
 * Enhanced version of useFindOneOpportunity that enriches external_snippet
 * resources with their article ingestion data (source and ingestion type).
 *
 * For resources of type external_snippet, this hook:
 * 1. Fetches the article details with ingestion data
 * 2. Extracts the source and ingestion type (domain/file/url)
 * 3. Adds this information to the resource
 */
export const useEnrichedOpportunity = (
    shopIntegrationId: number,
    opportunityId: number | undefined,
    options?: {
        query?: {
            enabled?: boolean
            refetchOnWindowFocus?: boolean
        }
    },
) => {
    const { client } = useHelpCenterApi()

    const opportunityQuery = useFindOneOpportunity(
        shopIntegrationId,
        opportunityId,
        options,
    )

    const externalSnippetResources = useMemo(() => {
        if (!opportunityQuery.data) return []

        return opportunityQuery.data.resources.filter(
            (resource) =>
                resource.type === ResourceType.EXTERNAL_SNIPPET &&
                resource.identifiers,
        )
    }, [opportunityQuery.data])

    const articleQueries = useQueries({
        queries: externalSnippetResources.map((resource) => ({
            queryKey: [
                'article-ingestion',
                resource.identifiers?.resourceSetId,
                resource.identifiers?.resourceId,
                resource.identifiers?.resourceLocale,
            ],
            queryFn: async (): Promise<ArticleWithIngestion | null> => {
                if (!client || !resource.identifiers) {
                    return null
                }

                const { resourceId, resourceSetId, resourceLocale } =
                    resource.identifiers

                if (!resourceLocale) {
                    return null
                }

                try {
                    const response = await client.getArticle({
                        help_center_id: Number(resourceSetId),
                        id: Number(resourceId),
                        locale: resourceLocale as Paths.GetArticle.Parameters.Locale,
                        with_ingestion: true,
                    })
                    return response.data
                } catch {
                    return null
                }
            },
            enabled:
                !!client &&
                !!opportunityQuery.data &&
                (options?.query?.enabled ?? true),
            staleTime: 5 * 60 * 1000,
        })),
    })

    const isLoadingArticles = articleQueries.some((query) => query.isLoading)
    const isLoading = opportunityQuery.isLoading || isLoadingArticles

    const enrichedData = useMemo(() => {
        if (!opportunityQuery.data) {
            return undefined
        }

        if (externalSnippetResources.length === 0) {
            return opportunityQuery.data
        }

        const allArticlesLoaded = articleQueries.every(
            (query) => !query.isLoading,
        )

        if (!allArticlesLoaded) {
            return opportunityQuery.data
        }

        return enrichOpportunityWithIngestion(
            opportunityQuery.data,
            articleQueries,
        )
    }, [opportunityQuery.data, externalSnippetResources, articleQueries])

    return {
        ...opportunityQuery,
        data: enrichedData,
        isLoading,
    }
}
