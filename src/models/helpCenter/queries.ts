import {useQuery, UseQueryOptions, useMutation} from '@tanstack/react-query'
import {MutationOverrides} from 'types/query'
import {Paths} from '../../rest_api/help_center_api/client.generated'
import {useHelpCenterApi} from '../../pages/settings/helpCenter/hooks/useHelpCenterApi'
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
} from './resources'

const STALE_TIME = 10 * 60 * 1000

export const helpCenterStatsKeys = {
    all: (helpCenterId: number) =>
        ['help-center', helpCenterId, 'stats'] as const,
    articleList: (
        helpCenterId: number,
        queryParams: Paths.ListArticles.QueryParameters
    ) =>
        [
            ...helpCenterStatsKeys.all(helpCenterId),
            'article-list',
            queryParams,
        ] as const,
    getCategoryTree: (
        helpCenterId: number,
        parentCategoryId: number,
        queryParams: Paths.GetCategoryTree.QueryParameters
    ) =>
        [
            ...helpCenterStatsKeys.all(helpCenterId),
            'get-category-tree',
            parentCategoryId,
            queryParams,
        ] as const,
}

export const helpCenterArticleKeys = (
    helpCenterId?: number,
    articleId?: number,
    locale?: string
) => ['help-center-article', helpCenterId, articleId, locale]

export const useGetHelpCenterArticleList = (
    helpCenterId: Paths.ListArticles.Parameters.HelpCenterId,
    queryParams: Paths.ListArticles.QueryParameters,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getHelpCenterArticles>>
    >
) => {
    const {client} = useHelpCenterApi()

    return useQuery({
        queryKey: helpCenterStatsKeys.articleList(helpCenterId, queryParams),
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
        queryKey: helpCenterStatsKeys.getCategoryTree(
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
    articleId?: Paths.GetArticle.Parameters.Id,
    helpCenterId?: Paths.GetArticle.Parameters.HelpCenterId,
    locale?: Paths.GetArticle.Parameters.Locale,
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
                    help_center_id: helpCenterId!,
                    id: articleId!,
                },
                {
                    locale: locale!,
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
