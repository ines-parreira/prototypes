import { useMutation, useQuery } from '@tanstack/react-query'

import { getGorgiasSSPApiClient } from 'rest_api/ssp_api/client'
import { OperationMethods, Paths } from 'rest_api/ssp_api/client.generated'
import { MutationOverrides } from 'types/query'

export const ARTICLE_RECOMMENDATION_PREDICTION_QUERY_KEY =
    'article-recommendation-prediction'

export const articleRecommendationdDefinitionKeys = {
    list: (params: {
        page: number
        helpCenterId?: number | null
        shopName?: string
        shopType?: string
        articleId?: number
        showCompleted?: boolean
        feedbackOptions?: Paths.GetArticleRecommendationPredictions.Parameters.FeedbackOptions
    }) => [ARTICLE_RECOMMENDATION_PREDICTION_QUERY_KEY, params],
}

export const useArticleRecommendationPredictions = ({
    page,
    shopName,
    shopType,
    helpCenterId,
    showCompleted,
    articleId,
    feedbackOptions,
}: {
    page: number
    shopType: string
    shopName: string
    helpCenterId?: number | null
    articleId?: number
    showCompleted?: boolean
    feedbackOptions?: Paths.GetArticleRecommendationPredictions.Parameters.FeedbackOptions
}) => {
    return useQuery({
        queryKey: articleRecommendationdDefinitionKeys.list({
            page,
            helpCenterId,
            shopName,
            shopType,
            articleId,
            feedbackOptions,
            showCompleted,
        }),
        queryFn: async () => {
            const client = await getGorgiasSSPApiClient()
            return client.getArticleRecommendationPredictions({
                page,
                help_center_id: helpCenterId!,
                shop_name: shopName,
                shop_type: shopType,
                article_id: articleId,
                completed: showCompleted ? undefined : false,
                feedback_options: feedbackOptions,
            })
        },
        select: (response) => {
            return {
                data: response?.data.data,
                meta: response?.data.meta,
            }
        },
        keepPreviousData: true,
        enabled: !!helpCenterId,
    })
}

export const useUpdateArticleRecommendationPredictions = (
    overrides?: MutationOverrides<
        OperationMethods['updateArticleRecommendationPredictions']
    >,
) => {
    return useMutation({
        mutationFn: async (params) => {
            const client = await getGorgiasSSPApiClient()
            return client.updateArticleRecommendationPredictions(...params)
        },
        ...overrides,
    })
}
