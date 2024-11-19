import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'

import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType} from 'models/integration/constants'
import {getIntegrationsByType} from 'state/integrations/selectors'

export const useIsOverviewPageEnabled = () => {
    const isFlagEnabled = useFlag(FeatureFlagKey.ConvertOverviewPage, false)

    const shopifyIntegrations = useAppSelector(
        getIntegrationsByType(IntegrationType.Shopify)
    )

    return isFlagEnabled && !!shopifyIntegrations.length
}
