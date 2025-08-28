import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'

export function useIsHeadlessShopifyStore(): boolean {
    return Boolean(useFlag(FeatureFlagKey.RevenueBetaShopifyHeadless))
}
