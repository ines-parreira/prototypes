import {useMemo} from 'react'

import {useGetHelpCenterArticleList} from 'models/helpCenter/queries'

import {Paths} from 'rest_api/help_center_api/client.generated'

import {GUIDANCE_ARTICLE_LIMIT} from '../constants'
import {mapArticleApiToGuidanceArticle} from '../utils/guidance.utils'

export const GUIDANCE_ARTICLES_QUERY_PARAMS: Paths.ListArticles.QueryParameters =
    {
        version_status: 'latest_draft',
        per_page: GUIDANCE_ARTICLE_LIMIT, // Temp limit until pagination is implemented
    }

export const useGuidanceArticles = (
    guidanceHelpCenterId: number,
    overrides?: Parameters<typeof useGetHelpCenterArticleList>[2]
) => {
    const {data, isLoading: isGuidanceArticleListLoading} =
        useGetHelpCenterArticleList(
            guidanceHelpCenterId,
            GUIDANCE_ARTICLES_QUERY_PARAMS,
            {
                ...overrides,
                refetchOnWindowFocus: false,
            }
        )

    const guidanceArticles = useMemo(
        () => (data ? data.data.map(mapArticleApiToGuidanceArticle) : []),
        [data]
    )

    return {
        guidanceArticles,
        isGuidanceArticleListLoading,
    }
}
