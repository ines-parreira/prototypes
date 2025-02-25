import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { Integration, IntegrationType } from 'models/integration/types'
import { getStatsStoreIntegrations } from 'state/stats/selectors'
import { getSortByName } from 'utils/getSortByName'

export function useShopifyIntegrations(): Integration[] {
    const allStoreIntegrations = useAppSelector(getStatsStoreIntegrations)
    const shopifyIntegrations = useMemo(() => {
        return allStoreIntegrations
            .filter(
                (integration) => integration.type === IntegrationType.Shopify,
            )
            .sort(getSortByName)
    }, [allStoreIntegrations])

    return shopifyIntegrations
}
