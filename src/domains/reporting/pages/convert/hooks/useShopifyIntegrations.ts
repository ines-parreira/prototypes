import { useMemo } from 'react'

import { getStatsStoreIntegrations } from 'domains/reporting/state/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'
import { Integration, IntegrationType } from 'models/integration/types'
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
