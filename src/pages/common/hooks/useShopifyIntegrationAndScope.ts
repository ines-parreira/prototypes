import useAppSelector from 'hooks/useAppSelector'
import {getShopifyIntegrationByShopName} from 'state/integrations/selectors'
import {
    isShopifyIntegration,
    ShopifyIntegration,
} from 'models/integration/types'

/**
 * Search for a Shopify integration by shop name
 * and return the integration id if found and if it needs to be updated
 */
export const useShopifyIntegrationAndScope = (
    shopName: string
): {
    integrationId: number | null
    integration: ShopifyIntegration | null
    needScopeUpdate: boolean
} => {
    const integration =
        useAppSelector(getShopifyIntegrationByShopName(shopName))?.toJS() ??
        null

    if (!isShopifyIntegration(integration)) {
        return {
            integrationId: null,
            integration: null,
            needScopeUpdate: false,
        }
    }

    return {
        integrationId: integration.id,
        integration,
        needScopeUpdate: integration?.meta?.need_scope_update ?? false,
    }
}
