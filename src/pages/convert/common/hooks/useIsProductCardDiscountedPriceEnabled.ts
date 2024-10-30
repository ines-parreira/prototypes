import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import {getLDClient} from 'utils/launchDarkly'

export const useIsProductCardDiscountedPriceEnabled = () => {
    return useFlag(FeatureFlagKey.ProductCardDiscountedPrice, false)
}

/** TMP: Patch to be able to use the flag in a class component */
export const getIsProductCardDiscountedPriceEnabled = () => {
    const client = getLDClient()
    return client.variation(
        FeatureFlagKey.ProductCardDiscountedPrice,
        false
    ) as boolean
}
