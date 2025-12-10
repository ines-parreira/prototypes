import { useMemo } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useQueryClient } from '@tanstack/react-query'

import type { GetArticleVersionStatus } from '@gorgias/help-center-types'

import { useFlag } from 'core/flags'
import {
    helpCenterKeys,
    useGetHelpCenterArticle,
} from 'models/helpCenter/queries'
import type {
    ArticleWithLocalTranslationAndRating,
    LocaleCode,
} from 'models/helpCenter/types'
import { getGuidanceArticleQueryParams } from 'pages/aiAgent/hooks/useGuidanceArticles'
import { mapArticleApiToGuidanceArticle } from 'pages/aiAgent/utils/guidance.utils'

export const useGuidanceArticle = ({
    guidanceArticleId,
    guidanceHelpCenterId,
    locale,
    enabled = true,
    versionStatus = 'current',
}: {
    guidanceArticleId: number
    guidanceHelpCenterId: number
    locale: LocaleCode
    versionStatus?: GetArticleVersionStatus
    enabled?: boolean
}) => {
    const isIncreaseGuidanceCreationLimit = useFlag(
        FeatureFlagKey.IncreaseGuidanceCreationLimit,
    )
    const queryClient = useQueryClient()
    const {
        data,
        isLoading: isGuidanceArticleLoading,
        refetch,
    } = useGetHelpCenterArticle(
        guidanceArticleId,
        guidanceHelpCenterId,
        locale,
        versionStatus,
        {
            enabled,
            initialData: () => {
                const articlesCache = queryClient.getQueryData(
                    helpCenterKeys.articles(
                        guidanceHelpCenterId,
                        getGuidanceArticleQueryParams(
                            isIncreaseGuidanceCreationLimit,
                            versionStatus,
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

    return { guidanceArticle, isGuidanceArticleLoading, refetch }
}
