import {ConvertPrice, Price} from 'models/billing/types'

export const getNextTier = (
    prices?: Price[],
    price?: Price
): Price | undefined => {
    if (!price || !prices) {
        return undefined
    }

    let minPrice: Price | undefined = undefined

    for (const priceConfig of prices) {
        if (!priceConfig) {
            continue
        }

        const isSameInterval = priceConfig.interval === price.interval
        const isSameProduct = priceConfig.product_id === price.product_id
        const isBigger =
            priceConfig.num_quota_tickets &&
            price.num_quota_tickets &&
            priceConfig.num_quota_tickets > price.num_quota_tickets &&
            priceConfig.amount >= price.amount
        const isBetter = !minPrice || minPrice.amount > priceConfig.amount

        // tier property is only available for convert prices at the moment
        const tier = (price as ConvertPrice)?.tier

        if (isSameInterval && isSameProduct && isBigger && isBetter && tier) {
            minPrice = priceConfig
        }
    }

    return minPrice
}
