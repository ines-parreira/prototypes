import {useQuery, useMutation} from '@tanstack/react-query'
import {getGorgiasSSPApiClient} from 'rest_api/ssp_api/client'
import {OperationMethods} from 'rest_api/ssp_api/client.generated'
import {MutationOverrides} from 'types/query'

export const articleRecommendationdDefinitionKeys = {
    list: (params: {
        page: number
        helpCenterId?: number | null
        shopName?: string
        shopType?: string
    }) => ['article-recommendation-prediction', params],
}

export const useArticleRecommendationPredictions = ({
    page,
    shopName,
    shopType,
    helpCenterId,
}: {
    page: number
    shopType: string
    shopName: string
    helpCenterId?: number | null
}) => {
    return useQuery({
        queryKey: articleRecommendationdDefinitionKeys.list({
            page,
            helpCenterId,
            shopName,
            shopType,
        }),
        queryFn: async () => {
            const client = await getGorgiasSSPApiClient()
            return client.getArticleRecommendationPredictions({
                page,
                help_center_id: helpCenterId!,
                shop_name: shopName,
                shop_type: shopType,
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
    >
) => {
    return useMutation({
        mutationFn: async (params) => {
            const client = await getGorgiasSSPApiClient()
            return client.updateArticleRecommendationPredictions(...params)
        },
        ...overrides,
    })
}
