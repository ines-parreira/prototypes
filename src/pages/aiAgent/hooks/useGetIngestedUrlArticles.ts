import { UseQueryOptions } from '@tanstack/react-query'

import { useGetArticleIngestionArticlesTitleAndStatus } from 'models/helpCenter/queries'

/**
 * Hook to fetch articles that were created from an ingested article
 * @param helpCenterId - The ID of the help center
 * @param articleIngestionId - The ID of the article ingestion log
 * @param overrides - Optional query options overrides
 * @returns Query result containing the articles created from the ingested article, with transformed data structure
 */
export const useGetIngestedUrlArticles = (
    helpCenterId: number,
    articleIngestionId: number,
    overrides?: UseQueryOptions,
) => {
    const queryResult = useGetArticleIngestionArticlesTitleAndStatus(
        {
            help_center_id: helpCenterId,
            article_ingestion_id: articleIngestionId,
        },
        {
            ...(overrides as any),
            enabled:
                !!helpCenterId &&
                !!articleIngestionId &&
                (overrides?.enabled ?? true),
            refetchOnWindowFocus: false,
        },
    )

    return {
        data: queryResult.data,
        isLoading: queryResult.isLoading,
        refetch: queryResult.refetch,
    }
}
