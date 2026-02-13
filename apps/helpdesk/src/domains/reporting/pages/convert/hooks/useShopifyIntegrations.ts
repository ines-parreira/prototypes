import { useMemo } from 'react'

import { getSortByName } from '@repo/utils'

import { getStatsStoreIntegrations } from 'domains/reporting/state/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'
import type { Integration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'

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
