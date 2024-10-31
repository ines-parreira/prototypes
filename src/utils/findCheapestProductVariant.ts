import {Product} from 'constants/integrations/types/shopify'

export const findCheapestProductVariant = (
    product: Product
): Product['variants'][number] =>
    product.variants.reduce(
        (cheapest, current) =>
            parseFloat(current.price) < parseFloat(cheapest.price)
                ? current
                : cheapest,
        product.variants[0]
    )
