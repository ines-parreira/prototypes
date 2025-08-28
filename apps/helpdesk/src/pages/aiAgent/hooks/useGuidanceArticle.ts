import { useMemo } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useQueryClient } from '@tanstack/react-query'

import { useFlag } from 'core/flags'
import {
    helpCenterKeys,
    useGetHelpCenterArticle,
} from 'models/helpCenter/queries'
import {
    ArticleWithLocalTranslationAndRating,
    LocaleCode,
} from 'models/helpCenter/types'
import { getGuidanceArticleQueryParams } from 'pages/aiAgent/hooks/useGuidanceArticles'
import { mapArticleApiToGuidanceArticle } from 'pages/aiAgent/utils/guidance.utils'

export const useGuidanceArticle = ({
    guidanceArticleId,
    guidanceHelpCenterId,
    locale,
}: {
    guidanceArticleId: number
    guidanceHelpCenterId: number
    locale: LocaleCode
}) => {
    const isIncreaseGuidanceCreationLimit = useFlag(
        FeatureFlagKey.IncreaseGuidanceCreationLimit,
    )
    const queryClient = useQueryClient()
    const { data, isLoading: isGuidanceArticleLoading } =
        useGetHelpCenterArticle(
            guidanceArticleId,
            guidanceHelpCenterId,
            locale,
            {
                initialData: () => {
                    const articlesCache = queryClient.getQueryData(
                        helpCenterKeys.articles(
                            guidanceHelpCenterId,
                            getGuidanceArticleQueryParams(
                                isIncreaseGuidanceCreationLimit,
                            ),
                        ),
                    ) as { data?: ArticleWithLocalTranslationAndRating[] }

                    const articleCache = articlesCache?.data?.find(
                        (article) => article.id === guidanceArticleId,
                    )

                    return articleCache
                },
            },
        )

    const guidanceArticle = useMemo(
        () => (data ? mapArticleApiToGuidanceArticle(data) : undefined),
        [data],
    )

    return { guidanceArticle, isGuidanceArticleLoading }
}
