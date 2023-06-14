import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'

// TODO: Remove this in https://linear.app/gorgias/issue/REV-930/[helpdesk-and-chat]-remove-the-ld-flag
export function useCanAddShopifyHistoryTriggers() {
    const flags = useFlags()
    return Boolean(flags[FeatureFlagKey.RevenueShopifyHistoryTriggers])
}
