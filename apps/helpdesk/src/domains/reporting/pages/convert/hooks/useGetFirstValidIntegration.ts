import { useMemo } from 'react'

import { useShopifyIntegrations } from 'domains/reporting/pages/convert/hooks/useShopifyIntegrations'
import type { ShopifyIntegration } from 'models/integration/types'

export function useGetFirstValidIntegration(selectedIntegrations: number[]) {
    const shopifyIntegrations = useShopifyIntegrations() as ShopifyIntegration[]

    const selectedIntegration = useMemo(() => {
        const selected = selectedIntegrations || []
        return shopifyIntegrations.filter((integration) =>
            selected.some((integrationId) => integrationId === integration.id),
        )?.[0]
    }, [selectedIntegrations, shopifyIntegrations])

    return selectedIntegration || null
}
