import {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'

import {getStatsStoreIntegrations} from 'state/stats/selectors'

import {IntegrationType} from 'models/integration/types'

export function useShopifyIntegrations() {
    const allStoreIntegrations = useAppSelector(getStatsStoreIntegrations)
    const shopifyIntegrations = useMemo(() => {
        return allStoreIntegrations.filter(
            (integration) => integration.type === IntegrationType.Shopify
        )
    }, [allStoreIntegrations])

    return shopifyIntegrations
}
