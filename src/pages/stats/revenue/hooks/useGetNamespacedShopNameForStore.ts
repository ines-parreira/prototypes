import {useMemo} from 'react'
import _head from 'lodash/head'

import {useShopifyIntegrations} from 'pages/stats/revenue/hooks/useShopifyIntegrations'
import {ShopifyIntegration} from 'models/integration/types'

export function useGetNamespacedShopNameForStore(
    selectedIntegrations: number[]
) {
    const shopifyIntegrations = useShopifyIntegrations() as ShopifyIntegration[]

    const namespacedShopName = useMemo(() => {
        const selected = selectedIntegrations || []
        const shop = _head(
            shopifyIntegrations.filter((integration) =>
                selected.some(
                    (integrationId) => integrationId === integration.id
                )
            )
        )
        return shop?.meta?.shop_name && shop?.type
            ? `${shop.type}:${shop.meta.shop_name}`
            : ''
    }, [selectedIntegrations, shopifyIntegrations])

    return namespacedShopName
}
