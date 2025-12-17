import { FeatureFlagKey, getLDClient, useFlag } from '@repo/feature-flags'

export const useIsProductCardDiscountedPriceEnabled = () => {
    return useFlag(FeatureFlagKey.ProductCardDiscountedPrice)
}

/** TMP: Patch to be able to use the flag in a class component */
export const getIsProductCardDiscountedPriceEnabled = () => {
    const client = getLDClient()
    return client.variation(
        FeatureFlagKey.ProductCardDiscountedPrice,
        false,
    ) as boolean
}
