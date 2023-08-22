import {FeatureFlagKey} from 'config/featureFlags'
import {getLDClient} from 'utils/launchDarkly'

export function canSeeCampaignImprovements() {
    return Boolean(
        getLDClient().allFlags()[FeatureFlagKey.RevenueCampaignImprovements]
    )
}
