import {useQuery, UseQueryOptions, useMutation} from '@tanstack/react-query'

import {MutationOverrides} from 'types/query'

import {useHelpCenterApi} from '../../pages/settings/helpCenter/hooks/useHelpCenterApi'
import {Paths} from '../../rest_api/help_center_api/client.generated'
import {
    getHelpCenterArticles,
    getCategoryTree,
    getHelpCenter,
    getHelpCenterArticle,
    createHelpCenter,
    updateHelpCenter,
    createHelpCenterTranslation,
    deleteHelpCenterTranslation,
    checkHelpCenterWithSubdomainExists,
    createArticle,
    createArticleTranslation,
    updateArticleTranslation,
    deleteArticle,
    deleteArticleTranslation,
    getHelpCenterList,
    getArticleIngestionLogs,
    startArticleIngestion,
    deleteArticleIngestionLog,
    createFileIngestion,
    getFileIngestion,
    deleteFileIngestion,
} from './resources'

const STALE_TIME = 10 * 60 * 1000

export const helpCenterKeys = {
    all: () => ['help-centers'] as const,
    details: () => ['help-center'] as const,
    detail: (helpCenterId: number) =>
        [...helpCenterKeys.details(), helpCenterId] as const,
    list: (queryParams: Paths.ListHelpCenters.QueryParameters) =>
        [...helpCenterKeys.all(), queryParams] as const,
    articles: (
        helpCenterId: number,
        queryParams?: Paths.ListArticles.QueryParameters
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
        queryParams: Paths.GetCategoryTree.QueryParameters
    ) =>
        [
            ...helpCenterKeys.detail(helpCenterId),
            'get-category-tree',
            parentCategoryId,
            queryParams,
        ] as const,
    articleIngestionLogs: (
        helpCenterId: number,
        queryParams?: Paths.GetArticleIngestionLogs.QueryParameters
    ) =>
        [
            ...helpCenterKeys.detail(helpCenterId),
            'article-ingestion-logs',
            queryParams,
        ].filter(Boolean),
    fileIngestions: (
        helpCenterId: number,
        queryParams?: Paths.GetFileIngestion.QueryParameters
    ) =>
        [
            ...helpCenterKeys.detail(helpCenterId),
            'file-ingestions',
            queryParams,
        ].filter(Boolean),
}

export const helpCenterArticleKeys = (
    helpCenterId: number,
    articleId: number,
    locale: string
) => [...helpCenterKeys.article(helpCenterId, articleId), locale]

export const useGetHelpCenterArticleList = (
    helpCenterId: Paths.ListArticles.Parameters.HelpCenterId,
    queryParams: Paths.ListArticles.QueryParameters,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getHelpCenterArticles>>
    >
) => {
    const {client} = useHelpCenterApi()

    return useQuery({
        queryKey: helpCenterKeys.articles(helpCenterId, queryParams),
        queryFn: async () =>
            getHelpCenterArticles(
                client,
                {help_center_id: helpCenterId},
                queryParams
            ),
        ...overrides,
        enabled: !!client && (overrides === undefined || overrides.enabled),
    })
}

export const useGetHelpCenterCategoryTree = (
    helpCenterId: Paths.GetCategoryTree.Parameters.HelpCenterId,
    parentCategoryId: Paths.GetCategoryTree.Parameters.ParentCategoryId,
    queryParams: Paths.GetCategoryTree.QueryParameters,
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof getCategoryTree>>>
) => {
    const {client} = useHelpCenterApi()

    return useQuery({
        queryKey: helpCenterKeys.getCategoryTree(
            helpCenterId,
            parentCategoryId,
            queryParams
        ),
        queryFn: async () =>
            getCategoryTree(
                client,
                {
                    help_center_id: helpCenterId,
                    parent_category_id: parentCategoryId,
                },
                queryParams
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
    >
) => {
    const {client} = useHelpCenterApi()

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
                }
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
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof getHelpCenter>>>
) => {
    const {client} = useHelpCenterApi()

    return useQuery({
        queryKey: ['help-center', helpCenterId, queryParameters],
        queryFn: async () =>
            getHelpCenter(
                client,
                {help_center_id: helpCenterId},
                queryParameters
            ),
        staleTime: STALE_TIME,
        ...overrides,
        enabled: !!client && (overrides === undefined || overrides.enabled),
    })
}

export const useCreateHelpCenter = (
    overrides?: MutationOverrides<typeof createHelpCenter>
) => {
    const {client: helpCenterClient} = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, data]) =>
            createHelpCenter(client, data),
        ...overrides,
    })
}

export const useUpdateHelpCenter = (
    overrides?: MutationOverrides<typeof updateHelpCenter>
) => {
    const {client: helpCenterClient} = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams, data]) =>
            updateHelpCenter(client, pathParams, data),
        ...overrides,
    })
}

export const useCreateHelpCenterTranslation = (
    overrides?: MutationOverrides<typeof createHelpCenterTranslation>
) => {
    const {client: helpCenterClient} = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams, data]) =>
            createHelpCenterTranslation(client, pathParams, data),
        ...overrides,
    })
}

export const useDeleteHelpCenterTranslation = (
    overrides?: MutationOverrides<typeof deleteHelpCenterTranslation>
) => {
    const {client: helpCenterClient} = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams]) =>
            deleteHelpCenterTranslation(client, pathParams),
        ...overrides,
    })
}

export const useCheckHelpCenterWithSubdomainExists = (
    overrides?: MutationOverrides<typeof checkHelpCenterWithSubdomainExists>
) => {
    const {client: helpCenterClient} = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams]) =>
            checkHelpCenterWithSubdomainExists(client, pathParams),
        retry: false,
        ...overrides,
    })
}

export const useCreateArticle = (
    overrides?: MutationOverrides<typeof createArticle>
) => {
    const {client: helpCenterClient} = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams, data]) =>
            createArticle(client, pathParams, data),
        ...overrides,
    })
}

export const useDeleteArticle = (
    overrides?: MutationOverrides<typeof deleteArticle>
) => {
    const {client: helpCenterClient} = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams]) =>
            deleteArticle(client, pathParams),
        ...overrides,
    })
}

export const useCreateArticleTranslation = (
    overrides?: MutationOverrides<typeof createArticleTranslation>
) => {
    const {client: helpCenterClient} = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams, data]) =>
            createArticleTranslation(client, pathParams, data),
        ...overrides,
    })
}

export const useUpdateArticleTranslation = (
    overrides?: MutationOverrides<typeof updateArticleTranslation>
) => {
    const {client: helpCenterClient} = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams, data]) =>
            updateArticleTranslation(client, pathParams, data),
        ...overrides,
    })
}

export const useDeleteArticleTranslation = (
    overrides?: MutationOverrides<typeof deleteArticleTranslation>
) => {
    const {client: helpCenterClient} = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams]) =>
            deleteArticleTranslation(client, pathParams),
        ...overrides,
    })
}

export const useGetHelpCenterList = (
    queryParams: Paths.ListHelpCenters.QueryParameters,
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof getHelpCenterList>>>
) => {
    const {client: helpCenterClient} = useHelpCenterApi()
    return useQuery({
        queryFn: async () => getHelpCenterList(helpCenterClient, queryParams),
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
    >
) => {
    const {client: helpCenterClient} = useHelpCenterApi()
    return useQuery({
        queryFn: async () =>
            getArticleIngestionLogs(helpCenterClient, pathParams),
        queryKey: helpCenterKeys.articleIngestionLogs(
            pathParams.help_center_id,
            pathParams.ids ? {ids: pathParams.ids} : undefined
        ),
        ...overrides,
        enabled:
            !!helpCenterClient &&
            (overrides === undefined || overrides.enabled),
    })
}

export const useStartArticleIngestion = (
    overrides?: MutationOverrides<typeof startArticleIngestion>
) => {
    const {client: helpCenterClient} = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams, data]) =>
            startArticleIngestion(client, pathParams, data),
        ...overrides,
    })
}

export const useDeleteArticleIngestionLog = (
    overrides?: MutationOverrides<typeof deleteArticleIngestionLog>
) => {
    const {client: helpCenterClient} = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams]) =>
            deleteArticleIngestionLog(client, pathParams),
        ...overrides,
    })
}

export const useCreateFileIngestion = (
    overrides?: MutationOverrides<typeof createFileIngestion>
) => {
    const {client: helpCenterClient} = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams, data]) =>
            createFileIngestion(client, pathParams, data),
        ...overrides,
    })
}

export const useGetFileIngestion = (
    pathParams: Paths.GetFileIngestion.PathParameters &
        Paths.GetFileIngestion.QueryParameters,
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof getFileIngestion>>>
) => {
    const {client: helpCenterClient} = useHelpCenterApi()
    return useQuery({
        queryFn: async () => getFileIngestion(helpCenterClient, pathParams),
        queryKey: helpCenterKeys.fileIngestions(
            pathParams.help_center_id,
            pathParams.ids ? {ids: pathParams.ids} : undefined
        ),
        ...overrides,
        enabled:
            !!helpCenterClient &&
            (overrides === undefined || overrides.enabled),
    })
}

export const useDeleteFileIngestion = (
    overrides?: MutationOverrides<typeof deleteFileIngestion>
) => {
    const {client: helpCenterClient} = useHelpCenterApi()

    return useMutation({
        mutationFn: ([client = helpCenterClient, pathParams]) =>
            deleteFileIngestion(client, pathParams),
        ...overrides,
    })
}
