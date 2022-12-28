import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'

export function useIsAllowedToAddDiscountCode(): boolean {
    const flags = useFlags()
    const isRevenueBetaTester: boolean =
        flags[FeatureFlagKey.RevenueBetaTesters]
    const isHidingDiscountCode: boolean =
        flags[FeatureFlagKey.RevenueHideDiscountCodeButton]

    return isRevenueBetaTester && !isHidingDiscountCode
}
