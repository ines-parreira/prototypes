import { useEffect, useMemo } from 'react'

import { useQueries } from '@tanstack/react-query'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { listIngestedResources } from 'models/helpCenter/resources'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { Components } from 'rest_api/help_center_api/client.generated'
import { reportError } from 'utils/errors'

import { IngestedResourceWithArticleId } from '../AiAgentScrapedDomainContent/types'
import { getTheLatestIngestionLog } from '../AiAgentScrapedDomainContent/utils'
import { useStoresDomainIngestionLogs } from './useStoresDomainIngestionLogs'

type IngestedResourceResponse = Components.Schemas.IngestedResourceListPageDto

type IngestedResourceWithHelpCenterId = IngestedResourceWithArticleId & {
    helpCenterId: number
}

export const useMultipleStoreWebsiteQuestions = ({
    snippetHelpCenterIds,
    shopName,
    queryOptionsOverrides,
}: {
    snippetHelpCenterIds: number[]
    shopName: string
    queryOptionsOverrides?: any
}) => {
    const { client: helpCenterClient } = useHelpCenterApi()

    const storeNames = useMemo(() => [shopName], [shopName])

    const {
        data: storesDomainIngestionLogs,
        isLoading: isIngestionLogsLoading,
    } = useStoresDomainIngestionLogs({
        storeNames,
        enabled: queryOptionsOverrides?.enabled ?? true,
    })

    const queries = useQueries({
        queries: snippetHelpCenterIds.map((helpCenterId) => {
            const storeDomainLogs = storesDomainIngestionLogs?.[shopName] || []
            const latestIngestionLog = getTheLatestIngestionLog(storeDomainLogs)
            const ingestionLogId = latestIngestionLog?.id

            return {
                queryKey: [
                    'store-website-questions',
                    helpCenterId,
                    ingestionLogId,
                ],
                queryFn: async (): Promise<IngestedResourceResponse | null> => {
                    if (!ingestionLogId || !helpCenterId) return null

                    const result = await listIngestedResources(
                        helpCenterClient,
                        {
                            help_center_id: helpCenterId,
                            article_ingestion_log_id: ingestionLogId,
                        },
                        {
                            page: 1,
                            per_page: 1000,
                        },
                    )
                    return result
                },
                ...queryOptionsOverrides,
                enabled:
                    !!helpCenterId &&
                    !!helpCenterClient &&
                    !isIngestionLogsLoading &&
                    (queryOptionsOverrides?.enabled ?? true),
                refetchOnWindowFocus: false,
            }
        }),
    })

    const isLoading = useMemo(
        () =>
            queryOptionsOverrides?.enabled === false
                ? false
                : isIngestionLogsLoading ||
                  queries.some((query) => query.isLoading),
        [queries, isIngestionLogsLoading, queryOptionsOverrides?.enabled],
    )

    const storeWebsiteQuestions = useMemo(() => {
        if (isLoading) return []

        return queries.flatMap((query, index) => {
            const result = query.data as IngestedResourceResponse | null
            if (!result?.data) return []

            const transformedResources: IngestedResourceWithHelpCenterId[] =
                result.data.map(
                    (
                        resource: Components.Schemas.IngestedResourceListDataDto,
                    ) => ({
                        ...resource,
                        helpCenterId: snippetHelpCenterIds[index],
                        web_pages: (resource.web_pages as any[]).map(
                            (page: any) => ({
                                url: page.url,
                                title: page.title,
                                pageType: page.pageType,
                            }),
                        ),
                    }),
                )

            return transformedResources
        })
    }, [queries, isLoading, snippetHelpCenterIds])

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
                            'Error during store website questions fetching (multiple)',
                    },
                })
            })
        }
    }, [queries])

    return { storeWebsiteQuestions, isLoading }
}
