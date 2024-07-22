import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import {useShopifyIntegrations} from 'pages/stats/convert/hooks/useShopifyIntegrations'
import {Integration} from 'models/integration/types'

export const useHasAccessToAILibrary = () => {
    const showForMultiBrands =
        useFlags()[FeatureFlagKey.ObservabilityShowAILibraryForMultiBrands]
    const isAIArticlesForMultiStoreEnabled =
        useFlags()[
            FeatureFlagKey.ObservabilityAllowAIGeneratedArticlesForMultiStore
        ]
    const shopifyIntegrations: Integration[] = useShopifyIntegrations()
    const hasMultiBrands = shopifyIntegrations.length > 1

    return (
        (!!showForMultiBrands && !!isAIArticlesForMultiStoreEnabled) ||
        !hasMultiBrands
    )
}
