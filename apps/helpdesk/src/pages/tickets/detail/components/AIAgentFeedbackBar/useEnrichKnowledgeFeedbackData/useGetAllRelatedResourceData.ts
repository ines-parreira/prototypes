import { FindFeedbackResult } from '@gorgias/knowledge-service-types'

import { StoreConfiguration } from 'models/aiAgent/types'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'

import { useGetResourceData } from './useEnrichFeedbackData'
import {
    useExtractDistinctHelpCenterFromResources,
    useExtractDistinctProductIdsFromResources,
} from './utils'

export const useGetAllRelatedResourceData = ({
    data,
    storeConfiguration,
    queriesEnabled,
}: {
    data?: FindFeedbackResult['data']
    storeConfiguration?: StoreConfiguration
    queriesEnabled?: boolean
}) => {
    const shopName = storeConfiguration?.storeName ?? ''
    const shopType = storeConfiguration?.shopType ?? ''

    const { integrationId } = useShopifyIntegrationAndScope(shopName)

    const shouldEnableQueries =
        !!shopName &&
        !!shopType &&
        !!data &&
        !!queriesEnabled &&
        !!integrationId

    const productIds = useExtractDistinctProductIdsFromResources(
        data?.executions,
    )

    const relatedHelpCenterData = useExtractDistinctHelpCenterFromResources(
        data?.executions,
        storeConfiguration,
        false,
    )

    const resourceData = useGetResourceData({
        queriesEnabled: shouldEnableQueries,
        shopName: shopName,
        shopType: shopType,
        shopIntegrationId: integrationId ?? 0,
        productIds,
        ...relatedHelpCenterData,
    })

    return resourceData
}
