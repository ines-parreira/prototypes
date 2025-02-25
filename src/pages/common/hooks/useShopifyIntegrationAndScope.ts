import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {
    isShopifyIntegration,
    ShopifyIntegration,
} from 'models/integration/types'
import { getShopifyIntegrationByShopName } from 'state/integrations/selectors'

/**
 * Search for a Shopify integration by shop name
 * and return the integration id if found and if it needs to be updated
 */
export const useShopifyIntegrationAndScope = (
    shopName: string,
): {
    integrationId: number | null
    integration: ShopifyIntegration | null
    needScopeUpdate: boolean
} => {
    const integration = useAppSelector(
        getShopifyIntegrationByShopName(shopName),
    )

    return useMemo(() => {
        const jsIntegration = integration?.toJS() ?? null
        if (!isShopifyIntegration(jsIntegration)) {
            return {
                integrationId: null,
                integration: null,
                needScopeUpdate: false,
            }
        }

        return {
            integrationId: jsIntegration.id,
            integration: jsIntegration,
            needScopeUpdate: jsIntegration?.meta?.need_scope_update ?? false,
        }
    }, [integration])
}
