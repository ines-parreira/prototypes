import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'

export const useIsConvertUniqueDiscountCodesEnabled = (): boolean => {
    const flags = useFlags()

    return !!flags[FeatureFlagKey.ConvertUniqueDiscountCodes]
}
