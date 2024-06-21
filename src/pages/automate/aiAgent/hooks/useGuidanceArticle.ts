import {useQueryClient} from '@tanstack/react-query'
import {useMemo} from 'react'
import {
    helpCenterKeys,
    useGetHelpCenterArticle,
} from 'models/helpCenter/queries'
import {
    ArticleWithLocalTranslationAndRating,
    LocaleCode,
} from 'models/helpCenter/types'
import {mapArticleApiToGuidanceArticle} from '../utils/guidance.utils'
import {GUIDANCE_ARTICLES_QUERY_PARAMS} from './useGuidanceArticles'

export const useGuidanceArticle = ({
    guidanceArticleId,
    guidanceHelpCenterId,
    locale,
}: {
    guidanceArticleId: number
    guidanceHelpCenterId: number
    locale: LocaleCode
}) => {
    const queryClient = useQueryClient()
    const {data, isLoading: isGuidanceArticleLoading} = useGetHelpCenterArticle(
        guidanceArticleId,
        guidanceHelpCenterId,
        locale,
        {
            initialData: () => {
                const articlesCache = queryClient.getQueryData(
                    helpCenterKeys.articles(
                        guidanceHelpCenterId,
                        GUIDANCE_ARTICLES_QUERY_PARAMS
                    )
                ) as {data?: ArticleWithLocalTranslationAndRating[]}

                const articleCache = articlesCache?.data?.find(
                    (article) => article.id === guidanceArticleId
                )

                return articleCache
            },
        }
    )

    const guidanceArticle = useMemo(
        () => (data ? mapArticleApiToGuidanceArticle(data) : undefined),
        [data]
    )

    return {guidanceArticle, isGuidanceArticleLoading}
}
