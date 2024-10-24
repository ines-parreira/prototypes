import _head from 'lodash/head'
import {useMemo} from 'react'

import {ShopifyIntegration} from 'models/integration/types'
import {useShopifyIntegrations} from 'pages/stats/convert/hooks/useShopifyIntegrations'

export function useGetFirstValidIntegration(selectedIntegrations: number[]) {
    const shopifyIntegrations = useShopifyIntegrations() as ShopifyIntegration[]

    const selectedIntegration = useMemo(() => {
        const selected = selectedIntegrations || []
        return _head(
            shopifyIntegrations.filter((integration) =>
                selected.some(
                    (integrationId) => integrationId === integration.id
                )
            )
        )
    }, [selectedIntegrations, shopifyIntegrations])

    return selectedIntegration || null
}
