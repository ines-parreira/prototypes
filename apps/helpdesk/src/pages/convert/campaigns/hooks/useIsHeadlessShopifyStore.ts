import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

export function useIsHeadlessShopifyStore(): boolean {
    return Boolean(useFlag(FeatureFlagKey.RevenueBetaShopifyHeadless))
}
