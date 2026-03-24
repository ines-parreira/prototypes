import { useCallback, useEffect, useMemo } from 'react'

import { reportError } from '@repo/logging'
import { useQueries } from '@tanstack/react-query'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { listIngestedResources } from 'models/helpCenter/resources'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import type { Components } from 'rest_api/help_center_api/client.generated'

import type { IngestedResourceWithArticleId } from '../AiAgentScrapedDomainContent/types'
import { getTheLatestIngestionLog } from '../AiAgentScrapedDomainContent/utils'
import { useStoresDomainIngestionLogs } from './useStoresDomainIngestionLogs'

type IngestedResourceResponse = Components.Schemas.IngestedResourceListPageDto

type IngestedResourceWithHelpCenterId = IngestedResourceWithArticleId & {
    helpCenterId: number
}

const PER_PAGE = 100

export const useMultipleStoreWebsiteQuestions = ({
    snippetHelpCenterIds,
    recordIds,
    shopName,
    queryOptionsOverrides,
}: {
    snippetHelpCenterIds: number[]
    recordIds?: number[]
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

    const getQueryEnabledStatus = useCallback(
        (helpCenterId: number, ingestionLogId?: number) =>
            !!helpCenterId &&
            !!helpCenterClient &&
            !!ingestionLogId &&
            !isIngestionLogsLoading &&
            (queryOptionsOverrides?.enabled ?? true),
        [
            helpCenterClient,
            isIngestionLogsLoading,
            queryOptionsOverrides?.enabled,
        ],
    )

    const firstPageQueries = useQueries({
        queries: snippetHelpCenterIds.map((helpCenterId) => {
            const storeDomainLogs = storesDomainIngestionLogs?.[shopName] || []
            const latestIngestionLog = getTheLatestIngestionLog(storeDomainLogs)
            const ingestionLogId = latestIngestionLog?.id

            return {
                queryKey: [
                    'store-website-questions',
                    helpCenterId,
                    ingestionLogId,
                    recordIds,
                    'page',
                    1,
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
                            per_page: PER_PAGE,
                        },
                    )

                    return result
                        ? {
                              ...result,
                              data: result?.data?.filter((resource) =>
                                  recordIds
                                      ? recordIds.includes(resource.article_id)
                                      : true,
                              ),
                          }
                        : null
                },
                ...queryOptionsOverrides,
                enabled: getQueryEnabledStatus(helpCenterId, ingestionLogId),
                refetchOnWindowFocus: false,
            }
        }),
    })

    const additionalPageQueries = useQueries({
        queries: snippetHelpCenterIds.flatMap((helpCenterId, index) => {
            const storeDomainLogs = storesDomainIngestionLogs?.[shopName] || []
            const latestIngestionLog = getTheLatestIngestionLog(storeDomainLogs)
            const ingestionLogId = latestIngestionLog?.id

            const firstPageQuery = firstPageQueries[index]
            const totalPages =
                (firstPageQuery.data as IngestedResourceResponse)?.meta
                    ?.nb_pages || 1
            const isFirstPageLoaded = firstPageQuery.isSuccess

            if (!isFirstPageLoaded || totalPages <= 1) {
                return []
            }

            return Array.from({ length: totalPages - 1 }, (_, i) => {
                const page = i + 2
                return {
                    queryKey: [
                        'store-website-questions',
                        helpCenterId,
                        ingestionLogId,
                        recordIds,
                        'page',
                        page,
                    ],
                    queryFn:
                        async (): Promise<IngestedResourceResponse | null> => {
                            if (!ingestionLogId || !helpCenterId) return null

                            const result = await listIngestedResources(
                                helpCenterClient,
                                {
                                    help_center_id: helpCenterId,
                                    article_ingestion_log_id: ingestionLogId,
                                },
                                {
                                    page,
                                    per_page: PER_PAGE,
                                },
                            )

                            return result
                                ? {
                                      ...result,
                                      data: result?.data?.filter((resource) =>
                                          recordIds
                                              ? recordIds.includes(
                                                    resource.article_id,
                                                )
                                              : true,
                                      ),
                                  }
                                : null
                        },
                    ...queryOptionsOverrides,
                    enabled: getQueryEnabledStatus(
                        helpCenterId,
                        ingestionLogId,
                    ),
                    refetchOnWindowFocus: false,
                }
            })
        }),
    })

    const allQueries = useMemo(
        () => [...firstPageQueries, ...additionalPageQueries],
        [firstPageQueries, additionalPageQueries],
    )

    const isLoading = useMemo(() => {
        if (!queryOptionsOverrides?.enabled) return false

        if (isIngestionLogsLoading) return true

        const firstPageLoading = firstPageQueries.some((query, index) => {
            const helpCenterId = snippetHelpCenterIds[index]
            const storeDomainLogs = storesDomainIngestionLogs?.[shopName] || []
            const latestIngestionLog = getTheLatestIngestionLog(storeDomainLogs)
            const ingestionLogId = latestIngestionLog?.id

            return (
                getQueryEnabledStatus(helpCenterId, ingestionLogId) &&
                query.isLoading
            )
        })

        const additionalPageLoading = additionalPageQueries.some((query) => {
            return query.isLoading
        })

        return firstPageLoading || additionalPageLoading
    }, [
        firstPageQueries,
        additionalPageQueries,
        snippetHelpCenterIds,
        storesDomainIngestionLogs,
        shopName,
        isIngestionLogsLoading,
        queryOptionsOverrides?.enabled,
        getQueryEnabledStatus,
    ])

    const storeWebsiteQuestions = useMemo(() => {
        if (isLoading) return []

        const allResources: IngestedResourceWithHelpCenterId[] = []

        firstPageQueries.forEach((query, index) => {
            const helpCenterId = snippetHelpCenterIds[index]
            const result = query.data as IngestedResourceResponse | null

            if (result?.data) {
                const filteredResources = result.data.filter((resource) =>
                    recordIds ? recordIds.includes(resource.article_id) : true,
                )

                const transformedResources: IngestedResourceWithHelpCenterId[] =
                    filteredResources.map(
                        (
                            resource: Components.Schemas.IngestedResourceListDataDto,
                        ) => ({
                            ...resource,
                            helpCenterId,
                            web_pages: (resource.web_pages as any[]).map(
                                (page: any) => ({
                                    url: page.url,
                                    title: page.title,
                                    pageType: page.pageType,
                                }),
                            ),
                        }),
                    )

                allResources.push(...transformedResources)
            }
        })

        let queryIndex = 0
        snippetHelpCenterIds.forEach((helpCenterId, index) => {
            const firstPageQuery = firstPageQueries[index]
            const totalPages =
                (firstPageQuery.data as IngestedResourceResponse)?.meta
                    ?.nb_pages || 1
            const isFirstPageLoaded = firstPageQuery.isSuccess

            if (!isFirstPageLoaded || totalPages <= 1) return

            for (let page = 2; page <= totalPages; page++) {
                const query = additionalPageQueries[queryIndex]
                const result = query?.data as IngestedResourceResponse | null

                if (result?.data) {
                    const filteredResources = result.data.filter((resource) =>
                        recordIds
                            ? recordIds.includes(resource.article_id)
                            : true,
                    )

                    const transformedResources: IngestedResourceWithHelpCenterId[] =
                        filteredResources.map(
                            (
                                resource: Components.Schemas.IngestedResourceListDataDto,
                            ) => ({
                                ...resource,
                                helpCenterId,
                                web_pages: (resource.web_pages as any[]).map(
                                    (page: any) => ({
                                        url: page.url,
                                        title: page.title,
                                        pageType: page.pageType,
                                    }),
                                ),
                            }),
                        )

                    allResources.push(...transformedResources)
                }
                queryIndex++
            }
        })

        return allResources
    }, [
        firstPageQueries,
        additionalPageQueries,
        snippetHelpCenterIds,
        isLoading,
        recordIds,
    ])

    useEffect(() => {
        const errors = allQueries
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
    }, [allQueries])

    return { storeWebsiteQuestions, isLoading }
}
