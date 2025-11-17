import { useMemo } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'
import {
    useGetHelpCenterArticleList,
    useGetMultipleHelpCenterArticleLists,
} from 'models/helpCenter/queries'
import type { Paths } from 'rest_api/help_center_api/client.generated'

import {
    GUIDANCE_ARTICLE_LIMIT,
    NEW_GUIDANCE_ARTICLE_LIMIT,
} from '../constants'
import { mapArticleApiToGuidanceArticle } from '../utils/guidance.utils'

export const getGuidanceArticleQueryParams = (
    isIncreaseGuidanceCreationLimit: boolean,
): Paths.ListArticles.QueryParameters => {
    return {
        version_status: 'latest_draft',
        per_page: isIncreaseGuidanceCreationLimit // Temp limit until pagination is implemented
            ? NEW_GUIDANCE_ARTICLE_LIMIT
            : GUIDANCE_ARTICLE_LIMIT,
    }
}

export const useGuidanceArticles = (
    guidanceHelpCenterId: number,
    overrides?: Parameters<typeof useGetHelpCenterArticleList>[2],
    paramsOverrides?: Paths.ListArticles.QueryParameters,
) => {
    const isIncreaseGuidanceCreationLimit = useFlag(
        FeatureFlagKey.IncreaseGuidanceCreationLimit,
    )
    const {
        data,
        isLoading: isGuidanceArticleListLoading,
        isFetched,
    } = useGetHelpCenterArticleList(
        guidanceHelpCenterId,
        {
            ...getGuidanceArticleQueryParams(isIncreaseGuidanceCreationLimit),
            ...paramsOverrides,
        },
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
    overrides?: Parameters<typeof useGetMultipleHelpCenterArticleLists>[2],
    paramsOverrides?: Paths.ListArticles.QueryParameters,
) => {
    const isIncreaseGuidanceCreationLimit = useFlag(
        FeatureFlagKey.IncreaseGuidanceCreationLimit,
    )
    const {
        articles,
        isLoading: isGuidanceArticleListLoading,
        queries,
    } = useGetMultipleHelpCenterArticleLists(
        guidanceHelpCenterIds,
        {
            ...getGuidanceArticleQueryParams(isIncreaseGuidanceCreationLimit),
            ...paramsOverrides,
        },
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
