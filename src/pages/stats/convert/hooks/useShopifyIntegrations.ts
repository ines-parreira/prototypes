import {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'

import {getStatsStoreIntegrations} from 'state/stats/selectors'

import {IntegrationType, Integration} from 'models/integration/types'
import {getSortByName} from 'utils/getSortByName'

export function useShopifyIntegrations(): Integration[] {
    const allStoreIntegrations = useAppSelector(getStatsStoreIntegrations)
    const shopifyIntegrations = useMemo(() => {
        return allStoreIntegrations
            .filter(
                (integration) => integration.type === IntegrationType.Shopify
            )
            .sort(getSortByName)
    }, [allStoreIntegrations])

    return shopifyIntegrations
}
