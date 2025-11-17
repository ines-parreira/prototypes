import type { Map } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'
import { getChatInstallationStatus } from 'state/entities/chatInstallationStatus/selectors'

/**
 * @param integration - Integration instance
 * @returns Boolean indicating whether the chat integration is installed on Shopify Checkout and the URL to manage the Checkout page settings.
 */
const useShopifyCheckoutChatInstallation = (integration: Map<any, any>) => {
    const { storeIntegration, isConnectedToShopify } =
        useStoreIntegration(integration)
    const { installedOnShopifyCheckout } = useAppSelector(
        getChatInstallationStatus,
    )

    if (!storeIntegration || !isConnectedToShopify) {
        return {
            installedOnShopifyCheckout: false,
            shopifyCheckoutChatInstallationUrl: null,
        }
    }

    const shopifyCheckoutChatInstallationUrl = `https://admin.shopify.com/store/${
        storeIntegration.name
    }/settings/checkout/editor`

    return {
        installedOnShopifyCheckout,
        shopifyCheckoutChatInstallationUrl,
    }
}

export default useShopifyCheckoutChatInstallation
