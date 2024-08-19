import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import {StoreIntegration} from 'models/integration/types'
import useAppSelector from 'hooks/useAppSelector'
import {getStoreIntegrations} from 'state/integrations/selectors'

export const useHasAccessToAILibrary = () => {
    const showForMultiBrands =
        useFlags()[FeatureFlagKey.ObservabilityShowAILibraryForMultiBrands]
    const isAIArticlesForMultiStoreEnabled =
        useFlags()[
            FeatureFlagKey.ObservabilityAllowAIGeneratedArticlesForMultiStore
        ]
    const allStoreIntegrations: StoreIntegration[] =
        useAppSelector(getStoreIntegrations)
    const hasMultiBrands = allStoreIntegrations.length > 1

    return (
        (!!showForMultiBrands && !!isAIArticlesForMultiStoreEnabled) ||
        !hasMultiBrands
    )
}
