import type { Map } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'
import { Tab } from 'pages/integrations/integration/types'
import { getChatInstallationStatus } from 'state/entities/chatInstallationStatus/selectors'

export const SHOPIFY_CHECKOUT_BANNER_TABS = [
    Tab.QuickReplies,
    Tab.Appearance,
    Tab.Preferences,
    Tab.Languages,
    Tab.Campaigns,
    Tab.Automate,
]

/**
 * Shopify Checkout Chat banner should be visible if:
 * - Integration is not connected to a store, or is connected to a Shopify store.
 * - Chat is not already installed on the Shopify Checkout page.
 * - Integration type is `gorgias_chat`.
 * - Tab is within the above defined list.
 * @param integrationType - Integration type (e.g. `gorgias_chat`)
 * @param tab - Tab (e.g. `appearance`)
 * @returns Boolean indicating if the Shopify Checkout Banner should be shown.
 */
export const useShouldShowShopifyCheckoutChatBanner = (
    integration: Map<any, any>,
    tab?: Tab,
): boolean => {
    const integrationType = integration.get('type')
    const { isConnected, isConnectedToShopify } =
        useStoreIntegration(integration)
    const { installedOnShopifyCheckout } = useAppSelector(
        getChatInstallationStatus,
    )

    if (
        !tab ||
        !SHOPIFY_CHECKOUT_BANNER_TABS.includes(tab) ||
        integrationType !== IntegrationType.GorgiasChat
    ) {
        return false
    }

    // If `gorgias_chat` integration is already connected to a non-Shopify store, return false.
    if (isConnected && !isConnectedToShopify) {
        return false
    }

    return !installedOnShopifyCheckout
}
