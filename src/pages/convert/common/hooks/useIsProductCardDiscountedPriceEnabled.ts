import {FeatureFlagKey} from 'config/featureFlags'
import {useFlag} from 'core/flags'
import {getLDClient} from 'utils/launchDarkly'

export const useIsProductCardDiscountedPriceEnabled = () => {
    return useFlag(FeatureFlagKey.ProductCardDiscountedPrice)
}

/** TMP: Patch to be able to use the flag in a class component */
export const getIsProductCardDiscountedPriceEnabled = () => {
    const client = getLDClient()
    return client.variation(
        FeatureFlagKey.ProductCardDiscountedPrice,
        false
    ) as boolean
}
