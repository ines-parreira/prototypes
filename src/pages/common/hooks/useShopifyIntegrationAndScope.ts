import useAppSelector from 'hooks/useAppSelector'
import {getShopifyIntegrationByShopName} from 'state/integrations/selectors'

/**
 * Search for a Shopify integration by shop name
 * and return the integration id if found and if it needs to be updated
 */
export const useShopifyIntegrationAndScope = (
    shopName: string
): {
    integrationId: number | null
    needScopeUpdate: boolean
} => {
    const shopifyIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName)
    )

    const needScopeUpdate = !shopifyIntegration.isEmpty()
        ? Boolean(
              shopifyIntegration.getIn(['meta', 'need_scope_update'], false)
          )
        : false

    return {
        integrationId: shopifyIntegration.getIn(['id'], null),
        needScopeUpdate,
    }
}
