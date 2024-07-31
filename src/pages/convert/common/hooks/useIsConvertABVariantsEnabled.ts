import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'

export const useIsConvertABVariantsEnabled = (): boolean => {
    const flags = useFlags()

    return !!flags[FeatureFlagKey.ConvertABVariants]
}
