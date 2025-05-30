import { useMemo } from 'react'

import {
    useGetHelpCenterArticleList,
    useGetMultipleHelpCenterArticleLists,
} from 'models/helpCenter/queries'
import { Paths } from 'rest_api/help_center_api/client.generated'

import { GUIDANCE_ARTICLE_LIMIT } from '../constants'
import { mapArticleApiToGuidanceArticle } from '../utils/guidance.utils'

export const GUIDANCE_ARTICLES_QUERY_PARAMS: Paths.ListArticles.QueryParameters =
    {
        version_status: 'latest_draft',
        per_page: GUIDANCE_ARTICLE_LIMIT, // Temp limit until pagination is implemented
    }

export const useGuidanceArticles = (
    guidanceHelpCenterId: number,
    overrides?: Parameters<typeof useGetHelpCenterArticleList>[2],
    paramsOverrides?: Paths.ListArticles.QueryParameters,
) => {
    const {
        data,
        isLoading: isGuidanceArticleListLoading,
        isFetched,
    } = useGetHelpCenterArticleList(
        guidanceHelpCenterId,
        { ...GUIDANCE_ARTICLES_QUERY_PARAMS, ...paramsOverrides },
        {
            ...overrides,
            refetchOnWindowFocus: false,
        },
    )

    const guidanceArticles = useMemo(
        () => (data ? data.data.map(mapArticleApiToGuidanceArticle) : []),
        [data],
    )

    return {
        guidanceArticles,
        isGuidanceArticleListLoading,
        isFetched,
    }
}

/**
 * Hook to fetch guidance articles from multiple help centers in parallel
 */
export const useMultipleGuidanceArticles = (
    guidanceHelpCenterIds: number[],
    overrides?: Parameters<typeof useGetHelpCenterArticleList>[2],
    paramsOverrides?: Paths.ListArticles.QueryParameters,
) => {
    const {
        articles,
        isLoading: isGuidanceArticleListLoading,
        queries,
    } = useGetMultipleHelpCenterArticleLists(
        guidanceHelpCenterIds,
        { ...GUIDANCE_ARTICLES_QUERY_PARAMS, ...paramsOverrides },
        {
            ...overrides,
            refetchOnWindowFocus: false,
        },
    )

    const guidanceArticles = useMemo(
        () =>
            articles.map((article) => {
                // The helpCenterId is already added by useGetMultipleHelpCenterArticleLists
                return {
                    ...mapArticleApiToGuidanceArticle(article),
                    helpCenterId: article.helpCenterId,
                }
            }),
        [articles],
    )

    // Check if any query is fetched
    const isFetched = useMemo(
        () => queries.some((query) => query.isFetched),
        [queries],
    )

    return {
        guidanceArticles,
        isGuidanceArticleListLoading,
        isFetched,
    }
}
