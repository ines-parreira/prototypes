import useAppSelector from 'hooks/useAppSelector'
import { ShopifyIntegration } from 'models/integration/types/shopify'
import {
    KnowledgeStatus,
    TemporaryKnowledgeData,
} from 'pages/aiAgent/Onboarding/components/steps/types'
import { getShopifyIntegrationByShopName } from 'state/integrations/selectors'

export const useGetKnowledgeStatusByShopName = (
    shopName: string,
    knowledgeData: TemporaryKnowledgeData[],
): KnowledgeStatus => {
    const shopifyIntegration: ShopifyIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName),
    ).toJS()

    if (!shopifyIntegration?.meta?.shop_domain) {
        return KnowledgeStatus.IN_PROGRESS
    }

    const shopifyKnowledgeData = knowledgeData.find(
        (data) => data.domain === shopifyIntegration?.meta?.shop_domain,
    )

    return shopifyKnowledgeData?.status || KnowledgeStatus.IN_PROGRESS
}
