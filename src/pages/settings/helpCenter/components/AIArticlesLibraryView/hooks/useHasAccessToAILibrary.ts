import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import {useShopifyIntegrations} from 'pages/stats/convert/hooks/useShopifyIntegrations'

export const useHasAccessToAILibrary = () => {
    const showForMultiBrands =
        useFlags()[FeatureFlagKey.ObservabilityShowAILibraryForMultiBrands]
    const shopifyIntegrations = useShopifyIntegrations()
    const hasMultiBrands = shopifyIntegrations.length > 1

    return !!showForMultiBrands || !hasMultiBrands
}
