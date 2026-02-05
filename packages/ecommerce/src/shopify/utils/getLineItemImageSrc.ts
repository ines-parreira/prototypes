import defaultImage from '../assets/shopify-product-default-image.png'
import type { OrderCardLineItem, OrderCardProduct } from '../types'
import { getSizedImageUrl } from './getSizedImageUrl'

export function getLineItemImageSrc(
    lineItem: OrderCardLineItem,
    product: OrderCardProduct | undefined,
): string {
    if (!product) {
        return defaultImage as string
    }

    const variantId = lineItem.variant_id

    if (variantId && product.images) {
        const variantImage = product.images.find((image) =>
            image.variant_ids.includes(variantId),
        )

        if (variantImage?.src) {
            const sizedUrl = getSizedImageUrl(variantImage.src, 'small')
            return sizedUrl || variantImage.src
        }
    }

    if (product.image?.src) {
        const sizedUrl = getSizedImageUrl(product.image.src, 'small')
        return sizedUrl || product.image.src
    }

    return defaultImage as string
}
