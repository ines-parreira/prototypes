import {useMemo} from 'react'
import _head from 'lodash/head'

import {useShopifyIntegrations} from 'pages/stats/revenue/hooks/useShopifyIntegrations'
import {ShopifyIntegration} from 'models/integration/types'

export function useGetCurrencyForStore(selectedIntegrations: number[]) {
    const shopifyIntegrations = useShopifyIntegrations() as ShopifyIntegration[]

    const currency = useMemo(() => {
        const selected = selectedIntegrations || []
        return (
            _head(
                shopifyIntegrations
                    .filter((integration) =>
                        selected.some(
                            (integrationId) => integrationId === integration.id
                        )
                    )
                    .map((integration) => integration.meta?.currency)
            ) || 'USD'
        )
    }, [selectedIntegrations, shopifyIntegrations])

    return currency
}
