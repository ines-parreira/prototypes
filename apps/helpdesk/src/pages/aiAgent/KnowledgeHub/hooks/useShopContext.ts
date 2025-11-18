import useAppSelector from 'hooks/useAppSelector'
import type { ShopifyIntegration } from 'models/integration/types'
import { getShopUrlFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { extractShopNameFromUrl } from 'pages/aiAgent/utils/extractShopNameFromUrl'
import {
    getShopifyIntegrationByShopName,
    getShopifyIntegrationsSortedByName,
} from 'state/integrations/selectors'

/**
 * Hook to get shop context including shop name and store URL
 * Resolves shop name from URL params or defaults to first integration
 */
export const useShopContext = () => {
    const allShopifyIntegrations = useAppSelector(
        getShopifyIntegrationsSortedByName,
    )
    const routeShopName = extractShopNameFromUrl(window.location.href)
    const shopName = routeShopName || allShopifyIntegrations[0]?.meta?.shop_name

    const storeIntegration: ShopifyIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName),
    ).toJS()
    const storeUrl = getShopUrlFromStoreIntegration(storeIntegration)

    return {
        shopName,
        storeUrl,
    }
}
