import {useQuery, UseQueryOptions} from '@tanstack/react-query'
import {Paths} from '../../rest_api/help_center_api/client.generated'
import {useHelpCenterApi} from '../../pages/settings/helpCenter/hooks/useHelpCenterApi'
import {
    getHelpCenterArticles,
    getCategoryTree,
    getHelpCenter,
    getHelpCenterArticle,
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
        queryKey: ['help-center-article', helpCenterId, articleId, locale],
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
