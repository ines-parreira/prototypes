import {useQuery} from '@tanstack/react-query'
import {getGorgiasSSPApiClient} from 'rest_api/ssp_api/client'

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
        queryKey: [
            'article-recommendation-predictions',
            page,
            shopName,
            shopType,
            helpCenterId,
        ],
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
