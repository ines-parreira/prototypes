import {FeatureFlagKey} from 'config/featureFlags'
import {getLDClient} from 'utils/launchDarkly'

export function isRevenueAddonSubscriber() {
    return Boolean(getLDClient().allFlags()[FeatureFlagKey.RevenueBetaTesters])
}
