import { useCallback, useMemo } from 'react'

import {
    useMutation,
    useQueries,
    useQuery,
    UseQueryOptions,
} from '@tanstack/react-query'

import { BaseArticle } from 'pages/aiAgent/AiAgentScrapedDomainContent/types'
import { HelpCenterClient } from 'rest_api/help_center_api/client'
import { MutationOverrides } from 'types/query'

import { useHelpCenterApi } from '../../pages/settings/helpCenter/hooks/useHelpCenterApi'
import { Paths } from '../../rest_api/help_center_api/client.generated'
import {
    checkHelpCenterWithSubdomainExists,
    copyArticle,
    createArticle,
    createArticleTranslation,
    createFileIngestion,
    createHelpCenter,
    createHelpCenterTranslation,
    deleteArticle,
    deleteArticleIngestionLog,
    deleteArticleTranslation,
    deleteFileIngestion,
    deleteHelpCenterTranslation,
    getArticleIngestionArticleTitlesAndStatus,
    getArticleIngestionLogs,
    getCategoryTree,
    getFileIngestion,
    getFileIngestionArticleTitlesAndStatus,
    getHelpCenter,
    getHelpCenterArticle,
    getHelpCenterArticles,
    getHelpCenterList,
    getIngestedResource,
    getIngestionLogs,
    getKnowledgeStatus,
    listIngestedResources,
    startArticleIngestion,
    startIngestion,
    updateAllIngestedResourcesStatus,
    updateArticleTranslation,
    updateHelpCenter,
    updateIngestedResource,
} from './resources'

const STALE_TIME = 10 * 60 * 1000
const CACHE_TIME = 10 * 60 * 1000 // 10 minutes

export const helpCenterKeys = {
    all: () => ['help-centers'] as const,
    details: () => ['help-center'] as const,
    detail: (helpCenterId: number) =>
        [...helpCenterKeys.details(), helpCenterId] as const,
    list: (
        queryParams:
            | Paths.ListHelpCenters.QueryParameters
            | Paths.ListHelpCenters.QueryParameters[],
    ) => [...helpCenterKeys.all(), queryParams] as const,
    articles: (
        helpCenterId: number,
        queryParams?: Paths.ListArticles.QueryParameters,
    ) =>
        [
            ...helpCenterKeys.detail(helpCenterId),
            'articles',
            queryParams,
        ].filter(Boolean), // remove undefined queryParams
    article: (helpCenterId: number, articleId: number) =>
        [...helpCenterKeys.articles(helpCenterId), articleId] as const,
    getCategoryTree: (
        helpCenterId: number,
        parentCategoryId: number,
        queryParams: Paths.GetCategoryTree.QueryParameters,
    ) =>
        [
            ...helpCenterKeys.detail(helpCenterId),
            'get-category-tree',
            parentCategoryId,
            queryParams,
        ] as const,
    articleIngestionLogs: (
        helpCenterId: number,
        queryParams?: Paths.GetArticleIngestionLogs.QueryParameters,
    ) =>
        [
            ...helpCenterKeys.detail(helpCenterId),
            'article-ingestion-logs',
            queryParams,
        ].filter(Boolean),
    articleIngestionLogsListRoot: () => [
        ...helpCenterKeys.all(),
        'article-ingestion-logs',
    ],
    articleIngestionLogsList: (
        params: {
            helpCenterId: number
            queryParams?: Paths.GetArticleIngestionLogs.QueryParameters
        }[],
    ) => [...helpCenterKeys.articleIngestionLogsListRoot(), params],
    ingestionLogs: (
        helpCenterId: number,
        queryParams?: Paths.GetIngestionLogs.QueryParameters,
    ) =>
        [
            ...helpCenterKeys.detail(helpCenterId),
            'ingestion-logs',
            queryParams,
        ].filter(Boolean),
    ingestionLogsList: (
        params: {
            helpCenterId: number
            queryParams?: Paths.GetIngestionLogs.QueryParameters
        }[],
    ) => [...helpCenterKeys.all(), 'ingestion-logs', params].filter(Boolean),
    fileIngestions: (
        helpCenterId: number,
        queryParams?: Paths.GetFileIngestion.QueryParameters,
    ) =>
        [
            ...helpCenterKeys.detail(helpCenterId),
            'file-ingestions',
            queryParams,
        ].filter(Boolean),
    ingestedResources: (
        helpCenterId: number,
        ingestionLogId: number,
        queryParams?: Paths.ListIngestedResources.QueryParameters,
    ) =>
        [
            ...helpCenterKeys.detail(helpCenterId),
            'ingested-resources',
            ingestionLogId,
            queryParams,
        ].filter(Boolean),
    ingestedResource: (helpCenterId: number, id: number) =>
        [
            ...helpCenterKeys.detail(helpCenterId),
            'ingested-resource',
            id,
        ].filter(Boolean),
    knowledgeStatus: () =>
        [...helpCenterKeys.all(), 'knowledge-status'].filter(Boolean),
    articleTranslations: (
        helpCenterId: number,
        articleId: number,
        queryParams?: Paths.ListArticleTranslations.QueryParameters,
    ) =>
        [
            ...helpCenterKeys.article(helpCenterId, articleId),
            'translations',
            queryParams,
        ].filter(Boolean),
}

export const helpCenterArticleKeys = (
    helpCenterId: number,
    articleId: number,
    locale: string,
) => [...helpCenterKeys.article(helpCenterId, articleId), locale]

export const useGetHelpCenterArticleList = (
    helpCenterId: Paths.ListArticles.Parameters.HelpCenterId,
    queryParams: Paths.ListArticles.QueryParameters,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getHelpCenterArticles>>
    >,
) => {
    const { client } = useHelpCenterApi()

    return useQuery({
        queryKey: helpCenterKeys.articles(helpCenterId, queryParams),
        queryFn: async () =>
            getHelpCenterArticles(
                client,
                { help_center_id: helpCenterId },
                queryParams,
            ),
        ...overrides,
        enabled: !!client && (overrides === undefined || overrides.enabled),
    })
}

export const fetchAllPagesForHelpCenter = async ({
    client,
    helpCenterId,
    queryParams,
}: {
    client?: HelpCenterClient
    helpCenterId: Paths.ListArticles.Parameters.HelpCenterId
    queryParams: Paths.ListArticles.QueryParameters
}): Promise<{
    data: NonNullable<Awaited<ReturnType<typeof getHelpCenterArticles>>>['data']
    meta: NonNullable<Awaited<ReturnType<typeof getHelpCenterArticles>>>['meta']
}> => {
    let allData: NonNullable<
        Awaited<ReturnType<typeof getHelpCenterArticles>>
    >['data'] = []
    let totalPages = 1
    let finalMeta:
        | NonNullable<Awaited<ReturnType<typeof getHelpCenterArticles>>>['meta']
        | null = null

    // Fetch first page to get total pages
    const firstResponse = await getHelpCenterArticles(
        client,
        { help_center_id: helpCenterId },
        { ...queryParams, page: 1 },
    )

    allData.push(...(firstResponse?.data || []))
    totalPages = firstResponse?.meta?.nb_pages || 1
    finalMeta = firstResponse?.meta ?? {
        item_count: 0,
        page: 1,
        per_page: 1000,
        current_page: '1',
        nb_pages: 1,
    }

    // Fetch remaining pages sequentially
    for (let page = 2; page <= totalPages; page++) {
        const response = await getHelpCenterArticles(
            client,
            { help_center_id: helpCenterId },
            { ...queryParams, page },
        )
        allData.push(...(response?.data || []))
    }

    return {
        data: allData,
        meta: { ...finalMeta, item_count: allData.length },
    }
}

/**
 * Hook to fetch articles from multiple help centers in parallel
 */
export const useGetMultipleHelpCenterArticleLists = (
    helpCenterIds: Paths.ListArticles.Parameters.HelpCenterId[],
    queryParams: Paths.ListArticles.QueryParameters,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof fetchAllPagesForHelpCenter>>
    >,
) => {
    const { client } = useHelpCenterApi()

    const getQueryEnabledStatus = (queryIndex: number) =>
        !!client && !!helpCenterIds[queryIndex] && (overrides?.enabled ?? true)

    const queries = useQueries({
        queries: helpCenterIds.map((helpCenterId, i) => ({
            queryKey: helpCenterKeys.articles(helpCenterId, queryParams),
            queryFn: async () =>
                fetchAllPagesForHelpCenter({
                    client,
                    helpCenterId,
                    queryParams,
                }),
            ...overrides,
            enabled: getQueryEnabledStatus(i),
        })),
    })

    // Compute loading state
    const isLoading = queries.some(
        (query, i) => getQueryEnabledStatus(i) && query.isLoading,
    )

    // Combine articles from all help centers and add helpCenterId to each article
    const articles = useMemo(() => {
        return queries.flatMap((query, index) => {
            const helpCenterId = helpCenterIds[index]

            return (query.data?.data || []).map((article) => ({
                ...article,
                helpCenterId, // Add helpCenterId to each article
            }))
        })
    }, [queries, helpCenterIds])

    return {
        queries,
        articles,
        isLoading,
    }
}

export const useGetHelpCenterCategoryTree = (
    helpCenterId: Paths.GetCategoryTree.Parameters.HelpCenterId,
    parentCategoryId: Paths.GetCategoryTree.Parameters.ParentCategoryId,
    queryParams: Paths.GetCategoryTree.QueryParameters,
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof getCategoryTree>>>,
) => {
    const { client } = useHelpCenterApi()

    return useQuery({
        queryKey: helpCenterKeys.getCategoryTree(
            helpCenterId,
            parentCategoryId,
            queryParams,
        ),
        queryFn: async () =>
            getCategoryTree(
                client,
                {
                    help_center_id: helpCenterId,
                    parent_category_id: parentCategoryId,
                },
                queryParams,
            ),
        staleTime: STALE_TIME,
        ...overrides,
        enabled: !!client && (overrides === undefined || overrides.enabled),
    })
}

export const useGetHelpCenterArticle = (
    articleId: Paths.GetArticle.Parameters.Id,
    helpCenterId: Paths.GetArticle.Parameters.HelpCenterId,
    locale: Paths.GetArticle.Parameters.Locale,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getHelpCenterArticle>>
    >,
) => {
    const { client } = useHelpCenterApi()

    return useQuery({
        queryKey: helpCenterArticleKeys(helpCenterId, articleId, locale),
        queryFn: async () =>
            getHelpCenterArticle(
                client,
                {
                    help_center_id: helpCenterId,
                    id: articleId,
                },
                {
                    locale: locale,
                },
            ),
        staleTime: STALE_TIME,
        ...overrides,
        enabled:
            !!client &&
            articleId !== undefined &&
            helpCenterId !== undefined &&
            !!locale &&
            (overrides === undefined || overrides.enabled),
    })
}

export const useGetHelpCenter = (
    helpCenterId: Paths.GetHelpCenter.Parameters.HelpCenterId,
    queryParameters: Paths.GetHelpCenter.QueryParameters,
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof getHelpCenter>>>,
) => {
    const { client } = useHelpCenterApi()

    return useQuery({
        queryKey: ['help-center', helpCenterId, queryParameters],
        queryFn: async () =>
            getHelpCenter(
                client,
                { help_center_id: helpCenterId },
                queryParameters,
            ),
        staleTime: STALE_TIME,
        ...overrides,
        enabled: !!client && (overrides === undefined || overrides.enabled),
    })
}

export const useGetMultipleHelpCenter = (
    helpCenterIds: Paths.GetHelpCenter.Parameters.HelpCenterId[],
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof getHelpCenter>>>,
    queryParameters: Paths.GetHelpCenter.QueryParameters = {},
) => {
    const { client: helpCenterClient } = useHelpCenterApi()

    const getQueryEnabledStatus = useCallback(
        (queryIndex: number) =>
            !!helpCenterClient &&
            !!helpCenterIds[queryIndex] &&
            (overrides?.enabled ?? true),
        [helpCenterClient, helpCenterIds, overrides?.enabled],
    )

    const queries = useQueries({
        queries: helpCenterIds.map((helpCenterId, i) => ({
            queryKey: [...helpCenterKeys.detail(helpCenterId), queryParameters],
            queryFn: async () =>
                getHelpCenter(
                    helpCenterClient,
                    { help_center_id: helpCenterId },
                    queryParameters,
                ),
            ...overrides,
            enabled: getQueryEnabledStatus(i),
            refetchOnWindowFocus: false,
        })),
    })

    const isLoading = useMemo(
        () =>
            queries.some(
                (query, i) => getQueryEnabledStatus(i) && query.isLoading,
            ),
        [queries, getQueryEnabledStatus],
    )

    const helpCenters = queries.map((query) => query.data)

    return {
        helpCenters,
        isLoading,
    }
}

export const useCreateHelpCenter = (
    overrides?: MutationOverrides<typeof createHelpCenter>,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, data]) =>
            createHelpCenter(client, data),
        ...overrides,
    })
}

export const useUpdateHelpCenter = (
    overrides?: MutationOverrides<typeof updateHelpCenter>,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams, data]) =>
            updateHelpCenter(client, pathParams, data),
        ...overrides,
    })
}

export const useCreateHelpCenterTranslation = (
    overrides?: MutationOverrides<typeof createHelpCenterTranslation>,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams, data]) =>
            createHelpCenterTranslation(client, pathParams, data),
        ...overrides,
    })
}

export const useDeleteHelpCenterTranslation = (
    overrides?: MutationOverrides<typeof deleteHelpCenterTranslation>,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams]) =>
            deleteHelpCenterTranslation(client, pathParams),
        ...overrides,
    })
}

export const useCheckHelpCenterWithSubdomainExists = (
    overrides?: MutationOverrides<typeof checkHelpCenterWithSubdomainExists>,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams]) =>
            checkHelpCenterWithSubdomainExists(client, pathParams),
        retry: false,
        ...overrides,
    })
}

export const useCreateArticle = (
    overrides?: MutationOverrides<typeof createArticle>,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams, data]) =>
            createArticle(client, pathParams, data),
        ...overrides,
    })
}

export const useDeleteArticle = (
    overrides?: MutationOverrides<typeof deleteArticle>,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams]) =>
            deleteArticle(client, pathParams),
        ...overrides,
    })
}

export const useCreateArticleTranslation = (
    overrides?: MutationOverrides<typeof createArticleTranslation>,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams, data]) =>
            createArticleTranslation(client, pathParams, data),
        ...overrides,
    })
}

export const useCopyArticle = (
    overrides?: MutationOverrides<typeof copyArticle>,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams, data]) =>
            copyArticle(client, pathParams, data),
        ...overrides,
    })
}

export const useUpdateArticleTranslation = (
    overrides?: MutationOverrides<typeof updateArticleTranslation>,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams, data]) =>
            updateArticleTranslation(client, pathParams, data),
        ...overrides,
    })
}

export const useDeleteArticleTranslation = (
    overrides?: MutationOverrides<typeof deleteArticleTranslation>,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams]) =>
            deleteArticleTranslation(client, pathParams),
        ...overrides,
    })
}

export const useGetHelpCenterList = (
    queryParams: Paths.ListHelpCenters.QueryParameters,
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof getHelpCenterList>>>,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()
    return useQuery({
        queryFn: async () => getHelpCenterList(helpCenterClient, queryParams),
        queryKey: helpCenterKeys.list(queryParams),
        ...overrides,
        enabled:
            !!helpCenterClient &&
            (overrides === undefined || overrides.enabled),
    })
}

export const useGetHelpCenterListMulti = (
    queryParams: Paths.ListHelpCenters.QueryParameters[],
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getHelpCenterList>>[]
    >,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()
    return useQuery({
        queryFn: async () => {
            const promises = queryParams.map((queryParams) => {
                return getHelpCenterList(helpCenterClient, queryParams)
            })
            return await Promise.all(promises)
        },
        queryKey: helpCenterKeys.list(queryParams),
        ...overrides,
        enabled:
            !!helpCenterClient &&
            (overrides === undefined || overrides.enabled),
    })
}

export const useGetArticleIngestionLogs = (
    pathParams: Paths.GetArticleIngestionLogs.PathParameters &
        Paths.GetArticleIngestionLogs.QueryParameters,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getArticleIngestionLogs>>
    >,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()
    return useQuery({
        queryFn: async () =>
            getArticleIngestionLogs(helpCenterClient, pathParams),
        queryKey: helpCenterKeys.articleIngestionLogs(
            pathParams.help_center_id,
            pathParams.ids ? { ids: pathParams.ids } : undefined,
        ),
        ...overrides,
        enabled:
            !!helpCenterClient &&
            (overrides === undefined || overrides.enabled),
    })
}

export const useGetArticleIngestionLogsList = (
    pathParams: (Paths.GetArticleIngestionLogs.PathParameters &
        Paths.GetArticleIngestionLogs.QueryParameters)[],
    overrides?: UseQueryOptions<
        Awaited<{
            helpCenterId: number
            ingestionLogs: Awaited<ReturnType<typeof getArticleIngestionLogs>>
        }>[]
    >,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()
    return useQuery({
        queryFn: async () => {
            const promises = pathParams.map((pathParam) =>
                getArticleIngestionLogs(helpCenterClient, pathParam).then(
                    (res) => {
                        return {
                            helpCenterId: pathParam.help_center_id,
                            ingestionLogs: res,
                        }
                    },
                ),
            )
            return await Promise.all(promises)
        },
        queryKey: helpCenterKeys.articleIngestionLogsList(
            pathParams.map(
                ({ help_center_id: helpCenterId, ...queryParams }) => ({
                    helpCenterId,
                    ...queryParams,
                }),
            ),
        ),
        ...overrides,
        enabled:
            !!helpCenterClient &&
            (overrides === undefined || overrides.enabled),
    })
}

export const useStartArticleIngestion = (
    overrides?: MutationOverrides<typeof startArticleIngestion>,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams, data]) =>
            startArticleIngestion(client, pathParams, data),
        ...overrides,
    })
}

export const useDeleteArticleIngestionLog = (
    overrides?: MutationOverrides<typeof deleteArticleIngestionLog>,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams]) =>
            deleteArticleIngestionLog(client, pathParams),
        ...overrides,
    })
}

export const useGetIngestionLogs = (
    pathParams: Paths.GetIngestionLogs.PathParameters &
        Paths.GetIngestionLogs.QueryParameters,
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof getIngestionLogs>>>,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()
    return useQuery({
        queryFn: async () => getIngestionLogs(helpCenterClient, pathParams),
        queryKey: helpCenterKeys.ingestionLogs(pathParams.help_center_id),
        staleTime: STALE_TIME,
        ...overrides,
        enabled:
            Boolean(helpCenterClient) &&
            (overrides === undefined || overrides.enabled),
    })
}

export const useGetIngestionLogsList = (
    pathParams: (Paths.GetIngestionLogs.PathParameters &
        Paths.GetIngestionLogs.QueryParameters)[],
    overrides?: UseQueryOptions<
        Awaited<{
            helpCenterId: number
            ingestionLogs: Awaited<ReturnType<typeof getIngestionLogs>>
        }>[]
    >,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()

    return useQuery({
        queryFn: async () => {
            const promises = pathParams.map((pathParam) =>
                getIngestionLogs(helpCenterClient, pathParam).then((res) => {
                    return {
                        helpCenterId: pathParam.help_center_id,
                        ingestionLogs: res,
                    }
                }),
            )
            return await Promise.all(promises)
        },
        queryKey: helpCenterKeys.ingestionLogsList(
            pathParams.map(
                ({ help_center_id: helpCenterId, ...queryParams }) => ({
                    helpCenterId,
                    ...queryParams,
                }),
            ),
        ),
        staleTime: STALE_TIME,
        ...overrides,
        enabled:
            Boolean(helpCenterClient) &&
            (overrides === undefined || overrides.enabled),
    })
}

export const useStartIngestion = (
    overrides?: MutationOverrides<typeof startIngestion>,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams, data]) =>
            startIngestion(client, pathParams, data),
        ...overrides,
    })
}

export const useListIngestedResources = (
    pathParams: Paths.ListIngestedResources.PathParameters,
    queryParams: Paths.ListIngestedResources.QueryParameters,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof listIngestedResources>>
    >,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()

    return useQuery({
        queryKey: helpCenterKeys.ingestedResources(
            pathParams.help_center_id,
            pathParams.article_ingestion_log_id,
            queryParams,
        ),
        queryFn: async () =>
            listIngestedResources(helpCenterClient, pathParams, queryParams),
        ...overrides,
        enabled:
            !!helpCenterClient &&
            (overrides === undefined || overrides.enabled),
    })
}

export const useGetIngestedResource = (
    pathParams: Paths.GetIngestedResource.PathParameters,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getIngestedResource>>
    >,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()
    return useQuery({
        queryKey: helpCenterKeys.ingestedResource(
            pathParams.help_center_id,
            pathParams.id,
        ),
        queryFn: async () => getIngestedResource(helpCenterClient, pathParams),
        ...overrides,
        enabled:
            !!helpCenterClient &&
            (overrides === undefined || overrides.enabled),
    })
}

export const useUpdateIngestedResource = (
    overrides?: MutationOverrides<typeof updateIngestedResource>,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()
    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams, data]) =>
            updateIngestedResource(client, pathParams, data),
        ...overrides,
    })
}

export const useUpdateAllIngestedResourcesStatus = (
    overrides?: MutationOverrides<typeof updateAllIngestedResourcesStatus>,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()
    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams, data]) =>
            updateAllIngestedResourcesStatus(client, pathParams, data),
        ...overrides,
    })
}

export const useCreateFileIngestion = (
    overrides?: MutationOverrides<typeof createFileIngestion>,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams, data]) =>
            createFileIngestion(client, pathParams, data),
        ...overrides,
    })
}

export const useGetFileIngestion = (
    pathParams: Paths.GetFileIngestion.PathParameters &
        Paths.GetFileIngestion.QueryParameters,
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof getFileIngestion>>>,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()
    return useQuery({
        queryFn: async () => getFileIngestion(helpCenterClient, pathParams),
        queryKey: helpCenterKeys.fileIngestions(
            pathParams.help_center_id,
            pathParams.ids ? { ids: pathParams.ids } : undefined,
        ),
        ...overrides,
        enabled:
            !!helpCenterClient &&
            (overrides === undefined || overrides.enabled),
    })
}

/**
 * Hook to fetch ingested files from multiple help centers in parallel
 */
export const useGetMultipleFileIngestionSnippets = (
    helpCenterIds: number[],
    fileParams?: { ids?: number[] },
    overrides?: UseQueryOptions<
        Array<
            BaseArticle & {
                helpCenterId: number
                ingestionId: number
                ingestionStatus: 'FAILED' | 'PENDING' | 'SUCCESSFUL'
            }
        >
    >,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()

    const getQueryEnabledStatus = useCallback(
        (queryIndex: number) =>
            !!helpCenterClient &&
            helpCenterIds[queryIndex] > 0 &&
            (overrides?.enabled ?? true),
        [helpCenterClient, helpCenterIds, overrides?.enabled],
    )

    const queries = useQueries({
        queries: helpCenterIds.map((helpCenterId, i) => ({
            queryKey: helpCenterKeys.fileIngestions(
                helpCenterId,
                fileParams?.ids ? { ids: fileParams.ids } : undefined,
            ),
            queryFn: async () => {
                const ingestionResult = await getFileIngestion(
                    helpCenterClient,
                    {
                        help_center_id: helpCenterId,
                        ...(fileParams?.ids ? { ids: fileParams.ids } : {}),
                    },
                )

                const result = (
                    await Promise.all(
                        ingestionResult?.data?.map(async (ingestion) => {
                            const articleResult =
                                await getFileIngestionArticleTitlesAndStatus(
                                    helpCenterClient,
                                    {
                                        help_center_id: helpCenterId,
                                        file_ingestion_id: ingestion.id,
                                    },
                                )

                            return (articleResult as BaseArticle[])?.map(
                                (article) => ({
                                    ingestionId: ingestion.id,
                                    ingestionStatus: ingestion.status,
                                    ...article,
                                    helpCenterId,
                                }),
                            )
                        }) ?? [],
                    )
                ).reduce((acc, curr) => {
                    acc.push(...curr)
                    return acc
                }, [])
                return result
            },
            ...overrides,
            enabled: getQueryEnabledStatus(i),
            refetchOnWindowFocus: false,
        })),
    })

    // Track loading state
    const isLoading = useMemo(
        () =>
            queries.some(
                (query, i) => getQueryEnabledStatus(i) && query.isLoading,
            ),
        [queries, getQueryEnabledStatus],
    )

    // Combine all ingested files and add helpCenterId to each
    const ingestedFiles = useMemo(() => {
        return queries.flatMap((query) => {
            return query.data ?? []
        })
    }, [queries])

    return {
        queries,
        isLoading,
        ingestedFiles,
    }
}

export const useDeleteFileIngestion = (
    overrides?: MutationOverrides<typeof deleteFileIngestion>,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams]) =>
            deleteFileIngestion(client, pathParams),
        ...overrides,
    })
}

export const useGetFileIngestionArticleTitlesAndStatus = (
    pathParams: {
        help_center_id: number
        file_ingestion_id: number
    },
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getFileIngestionArticleTitlesAndStatus>>
    >,
) => {
    const { client } = useHelpCenterApi()

    return useQuery({
        queryKey: [
            ...helpCenterKeys.fileIngestions(pathParams.help_center_id),
            'article-titles',
            pathParams.file_ingestion_id,
        ],
        queryFn: async () =>
            getFileIngestionArticleTitlesAndStatus(client, pathParams),
        ...overrides,
        enabled: !!client && (overrides === undefined || overrides.enabled),
    })
}

export const useGetArticleIngestionArticlesTitleAndStatus = (
    pathParams: {
        help_center_id: number
        article_ingestion_id: number
    },
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getArticleIngestionArticleTitlesAndStatus>>
    >,
) => {
    const { client } = useHelpCenterApi()

    return useQuery({
        queryKey: [
            ...helpCenterKeys.articleIngestionLogs(pathParams.help_center_id),
            'article-titles',
            pathParams.article_ingestion_id,
        ],
        queryFn: async () =>
            getArticleIngestionArticleTitlesAndStatus(client, pathParams),
        ...overrides,
        enabled: !!client && (overrides === undefined || overrides.enabled),
    })
}

export const useGetKnowledgeStatus = (
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof getKnowledgeStatus>>>,
) => {
    const { client: helpCenterClient } = useHelpCenterApi()
    return useQuery({
        queryFn: async () => getKnowledgeStatus(helpCenterClient),
        queryKey: helpCenterKeys.knowledgeStatus(),
        staleTime: STALE_TIME,
        ...overrides,
        enabled:
            Boolean(helpCenterClient) &&
            (overrides === undefined || overrides.enabled),
    })
}

export const useGetArticleTranslations = (
    helpCenterId: Paths.ListArticleTranslations.Parameters.HelpCenterId,
    articleId: Paths.ListArticleTranslations.Parameters.ArticleId,
    queryParams?: Paths.ListArticleTranslations.QueryParameters,
    overrides?: UseQueryOptions<
        Awaited<Paths.ListArticleTranslations.Responses.$200>
    >,
) => {
    const { client } = useHelpCenterApi()

    return useQuery({
        queryKey: helpCenterKeys.articleTranslations(
            helpCenterId,
            articleId,
            queryParams,
        ),
        queryFn: async () => {
            const response = await client!.listArticleTranslations({
                help_center_id: helpCenterId,
                article_id: articleId,
                ...queryParams,
            })
            return response.data
        },
        staleTime: STALE_TIME,
        cacheTime: CACHE_TIME,
        ...overrides,
        enabled:
            !!client &&
            helpCenterId !== undefined &&
            articleId !== undefined &&
            (overrides === undefined || overrides.enabled),
        refetchOnWindowFocus: false,
    })
}
