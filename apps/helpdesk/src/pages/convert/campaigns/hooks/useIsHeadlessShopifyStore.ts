import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

export function useIsHeadlessShopifyStore(): boolean {
    return Boolean(useFlag(FeatureFlagKey.RevenueBetaShopifyHeadless))
}
