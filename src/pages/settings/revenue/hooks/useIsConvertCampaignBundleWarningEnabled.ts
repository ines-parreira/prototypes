import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'

export function useIsConvertCampaignBundleWarningEnabled(): boolean {
    const flags = useFlags()
    return Boolean(flags[FeatureFlagKey.ConvertCampaignBundleWarning])
}
