import type { OrderImage, ShopifyProductData } from '../types'

export function extractFeaturedImage(
    data: ShopifyProductData,
): OrderImage | null {
    if (data.image) {
        return {
            alt: data.image.alt,
            src: data.image.src,
            variant_ids: data.image.variant_ids || [],
        }
    }

    if (data.featuredMedia?.image) {
        return {
            alt: data.featuredMedia.image.altText,
            src: data.featuredMedia.image.url,
            variant_ids: [],
        }
    }

    return null
}
