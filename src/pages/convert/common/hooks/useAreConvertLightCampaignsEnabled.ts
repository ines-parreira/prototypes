import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'

export function useAreConvertLightCampaignsEnabled(): boolean {
    const flags = useFlags()
    return !!flags[FeatureFlagKey.ConvertLightCampaign]
}
