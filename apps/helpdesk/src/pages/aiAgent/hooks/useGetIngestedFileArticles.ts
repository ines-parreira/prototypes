import { UseQueryOptions } from '@tanstack/react-query'

import { useGetFileIngestionArticleTitlesAndStatus } from 'models/helpCenter/queries'

/**
 * Hook to fetch articles that were created from an ingested file
 * @param helpCenterId - The ID of the help center
 * @param fileIngestionId - The ID of the file ingestion log
 * @param overrides - Optional query options overrides
 * @returns Query result containing the articles created from the ingested file, with transformed data structure
 */
export const useGetIngestedFileArticles = (
    helpCenterId: number,
    fileIngestionId: string,
    overrides?: UseQueryOptions,
) => {
    const queryResult = useGetFileIngestionArticleTitlesAndStatus(
        {
            help_center_id: helpCenterId,
            file_ingestion_id: Number(fileIngestionId),
        },
        {
            ...(overrides as any),
            enabled:
                !!helpCenterId &&
                !!fileIngestionId &&
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
