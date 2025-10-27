import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

export const useShopIntegrationId = (
    shopName: string | undefined,
): number | undefined => {
    const shopifyIntegrations = useAppSelector(
        getShopifyIntegrationsSortedByName,
    )

    return useMemo(() => {
        if (shopName === undefined) return undefined

        const integration = shopifyIntegrations.find(
            (integration) => integration.name === shopName,
        )
        return integration?.id ?? undefined
    }, [shopifyIntegrations, shopName])
}
