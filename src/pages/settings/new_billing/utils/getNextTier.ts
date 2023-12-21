import {ConvertPrice, Price} from 'models/billing/types'

export const getNextTier = (
    prices?: Price[],
    price?: Price
): Price | undefined => {
    // tier property is only available for convert prices at the moment
    const currentTier = (price as ConvertPrice)?.tier
    if (!currentTier || !prices) {
        return undefined
    }

    return prices?.find((price) => {
        if (
            price.interval === price?.interval &&
            price.product_id === price?.product_id &&
            (price as ConvertPrice)?.tier === currentTier + 1
        ) {
            return price
        }
    })
}
