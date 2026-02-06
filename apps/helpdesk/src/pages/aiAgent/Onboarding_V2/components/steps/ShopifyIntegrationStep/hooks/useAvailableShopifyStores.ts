import { useMemo } from 'react'

import type { StoreIntegration } from 'models/integration/types'
import { useStoreConfigurationForAccount } from 'pages/aiAgent/hooks/useStoreConfigurationForAccount'

interface UseAvailableShopifyStoresParams {
    accountDomain: string
    shopifyIntegrations: StoreIntegration[]
}

interface UseAvailableShopifyStoresReturn {
    availableStores: StoreIntegration[]
    isLoading: boolean
}

export function useAvailableShopifyStores({
    accountDomain,
    shopifyIntegrations,
}: UseAvailableShopifyStoresParams): UseAvailableShopifyStoresReturn {
    const { isLoading: isLoadingStoreConfigurations, storeConfigurations } =
        useStoreConfigurationForAccount({
            accountDomain,
            storesName: shopifyIntegrations.map(
                (integration) => integration.name,
            ),
        })

    const availableStores = useMemo(
        () =>
            shopifyIntegrations.filter(
                (integration) =>
                    !storeConfigurations?.some(
                        (configuration) =>
                            configuration?.storeName === integration.name,
                    ),
            ),
        [shopifyIntegrations, storeConfigurations],
    )

    return {
        availableStores,
        isLoading: isLoadingStoreConfigurations,
    }
}
