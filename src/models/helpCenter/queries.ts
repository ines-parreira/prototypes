import {useQuery, UseQueryOptions} from '@tanstack/react-query'
import {Paths} from '../../rest_api/help_center_api/client.generated'
import {useHelpCenterApi} from '../../pages/settings/helpCenter/hooks/useHelpCenterApi'
import {getHelpCenterArticles, getCategoryTree} from './resources'

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
        ...overrides,
        enabled: !!client && (overrides === undefined || overrides.enabled),
    })
}
