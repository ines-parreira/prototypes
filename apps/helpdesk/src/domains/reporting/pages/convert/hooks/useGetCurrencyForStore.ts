import { useMemo } from 'react'

import { useShopifyIntegrations } from 'domains/reporting/pages/convert/hooks/useShopifyIntegrations'
import type { ShopifyIntegration } from 'models/integration/types'

export function useGetCurrencyForStore(selectedIntegrations: number[]) {
    const shopifyIntegrations = useShopifyIntegrations() as ShopifyIntegration[]

    const currency = useMemo(() => {
        const selected = selectedIntegrations || []
        return (
            shopifyIntegrations
                .filter((integration) =>
                    selected.some(
                        (integrationId) => integrationId === integration.id,
                    ),
                )
                .map((integration) => integration.meta?.currency)?.[0] || 'USD'
        )
    }, [selectedIntegrations, shopifyIntegrations])

    return currency
}
