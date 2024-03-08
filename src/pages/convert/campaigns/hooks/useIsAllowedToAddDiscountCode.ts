import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'

export function useIsAllowedToAddDiscountCode(): boolean {
    const flags = useFlags()
    const isHidingDiscountCode: boolean =
        flags[FeatureFlagKey.RevenueHideDiscountCodeButton]

    return useIsConvertSubscriber() && !isHidingDiscountCode
}
