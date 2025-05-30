import { useEffect, useMemo } from 'react'

import { useQueries } from '@tanstack/react-query'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useGetArticleIngestionLogs } from 'models/helpCenter/queries'
import { getArticleIngestionLogs } from 'models/helpCenter/resources'
import { mapArticleIngestionLogsToSourceItem } from 'pages/aiAgent/components/PublicSourcesSection/utils'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { reportError } from 'utils/errors'

export const usePublicResources = ({
    helpCenterId,
    overrides,
    queryOptionsOverrides,
}: {
    helpCenterId?: number
    overrides?: Partial<Parameters<typeof useGetArticleIngestionLogs>[0]>
    queryOptionsOverrides?: Parameters<typeof useGetArticleIngestionLogs>[1]
}) => {
    const {
        data: articleIngestionLogs,
        error,
        isLoading: isSourceItemsListLoading,
    } = useGetArticleIngestionLogs(
        {
            help_center_id: helpCenterId ?? -1,
            ...overrides,
        },
        {
            ...queryOptionsOverrides,
            refetchOnWindowFocus: false,
            enabled: !!helpCenterId,
        },
    )

    const sourceItems = useMemo(
        () =>
            isSourceItemsListLoading
                ? []
                : articleIngestionLogs
                      ?.map(mapArticleIngestionLogsToSourceItem)
                      .sort((a, b) =>
                          a.createdDatetime < b.createdDatetime ? -1 : 1,
                      ),
        [articleIngestionLogs, isSourceItemsListLoading],
    )

    useEffect(() => {
        if (error) {
            reportError(error, {
                tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                extra: {
                    context: 'Error during article ingestion logs fetching',
                },
            })
        }
    }, [error])

    return { sourceItems, isSourceItemsListLoading }
}

/**
 * Hook to fetch public resources from multiple help centers in parallel
 */
export const useMultiplePublicResources = ({
    helpCenterIds,
    overrides,
    queryOptionsOverrides,
}: {
    helpCenterIds: number[]
    overrides?: Partial<Parameters<typeof useGetArticleIngestionLogs>[0]>
    queryOptionsOverrides?: Parameters<typeof useGetArticleIngestionLogs>[1]
}) => {
    const { client: helpCenterClient } = useHelpCenterApi()

    // Create a query for each help center ID
    const queries = useQueries({
        queries: helpCenterIds.map((helpCenterId) => ({
            queryKey: ['article-ingestion-logs', helpCenterId, overrides],
            queryFn: async () => {
                const result = await getArticleIngestionLogs(helpCenterClient, {
                    help_center_id: helpCenterId,
                    ...overrides,
                })
                return result
            },
            ...queryOptionsOverrides,
            enabled:
                helpCenterId > 0 &&
                !!helpCenterClient &&
                (queryOptionsOverrides?.enabled ?? true),
            refetchOnWindowFocus: false,
        })),
    })

    // Track loading state
    const isSourceItemsListLoading = useMemo(
        () => queries.some((query) => query.isLoading),
        [queries],
    )

    // Combine and process results
    const sourceItems = useMemo(() => {
        if (isSourceItemsListLoading) return []

        return queries.flatMap((query, index) => {
            const result = query.data
            return (
                result
                    ?.map((item) => ({
                        ...mapArticleIngestionLogsToSourceItem(item),
                        helpCenterId: helpCenterIds[index],
                    }))
                    .sort((a, b) =>
                        a.createdDatetime < b.createdDatetime ? -1 : 1,
                    ) || []
            )
        })
    }, [queries, isSourceItemsListLoading, helpCenterIds])

    // Handle errors
    useEffect(() => {
        const errors = queries
            .filter((query) => query.error)
            .map((query) => query.error)

        if (errors.length) {
            errors.forEach((error) => {
                reportError(error, {
                    tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                    extra: {
                        context:
                            'Error during article ingestion logs fetching (multiple)',
                    },
                })
            })
        }
    }, [queries])

    return { sourceItems, isSourceItemsListLoading }
}
