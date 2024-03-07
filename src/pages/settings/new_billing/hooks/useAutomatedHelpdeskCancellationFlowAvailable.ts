import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from '../../../../config/featureFlags'
import {HelpdeskPrice} from '../../../../models/billing/types'
import {isStarterTierPrice} from '../../../../models/billing/utils'

const useAutomatedHelpdeskCancellationFlowAvailable = (
    helpdeskProduct: HelpdeskPrice | null
) => {
    const isAutomatedHelpdeskCancellationFlowFlagSet =
        !!useFlags()[FeatureFlagKey.HelpdeskProductAutomatedCancellation]

    if (!helpdeskProduct) {
        return false
    }

    const isProTierPlan = helpdeskProduct.internal_id.includes('pro')
    const isBasicTierPlan = helpdeskProduct.internal_id.includes('basic')
    const isStarterTierPlan = isStarterTierPrice(helpdeskProduct)

    return (
        isAutomatedHelpdeskCancellationFlowFlagSet &&
        (isProTierPlan || isBasicTierPlan || isStarterTierPlan)
    )
}

export default useAutomatedHelpdeskCancellationFlowAvailable
