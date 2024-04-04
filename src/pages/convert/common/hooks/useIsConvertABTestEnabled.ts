import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'

export function useIsConvertABTestEnabled(): boolean {
    const flags = useFlags()
    return !!flags[FeatureFlagKey.ConvertABTest]
}
