import {useQuery, UseQueryOptions} from '@tanstack/react-query'
import {Paths} from '../../rest_api/help_center_api/client.generated'
import {useHelpCenterApi} from '../../pages/settings/helpCenter/hooks/useHelpCenterApi'
import {getHelpCenterArticles} from './resources'

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
