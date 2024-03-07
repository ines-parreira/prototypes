import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'

export function useIsConvertOnboardingUiEnabled(): boolean {
    const flags = useFlags()
    return !!flags[FeatureFlagKey.ConvertOnboardingUi]
}
