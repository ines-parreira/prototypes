import type { Map } from 'immutable'

import { useInstallationStatus } from 'pages/integrations/integration/components/gorgias_chat/hooks/useInstallationStatus'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

/**
 * @param integration - Integration instance
 * @returns Boolean indicating whether the chat integration is installed on Shopify Checkout and the URL to manage the Checkout page settings.
 */
const useShopifyCheckoutChatInstallation = (integration: Map<any, any>) => {
    const appId: string | undefined = integration.getIn(['meta', 'app_id'])
    const { storeIntegration, isConnectedToShopify } =
        useStoreIntegration(integration)
    const { installedOnShopifyCheckout } = useInstallationStatus(appId)

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
