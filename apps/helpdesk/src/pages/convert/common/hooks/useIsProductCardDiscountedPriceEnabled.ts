import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

export const useIsProductCardDiscountedPriceEnabled = () => {
    return useFlag(FeatureFlagKey.ProductCardDiscountedPrice)
}
