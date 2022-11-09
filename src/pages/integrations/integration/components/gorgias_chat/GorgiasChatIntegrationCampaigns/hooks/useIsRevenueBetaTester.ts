import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'

export function useIsRevenueBetaTester(): boolean {
    const flags = useFlags()
    return Boolean(flags[FeatureFlagKey.RevenueBetaTesters])
}
