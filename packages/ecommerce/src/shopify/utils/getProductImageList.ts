import type { OrderImage, ShopifyProductData } from '../types'

export function getProductImageList(data: ShopifyProductData): OrderImage[] {
    if (data.images?.length) {
        return data.images.map((img) => ({
            alt: img.alt,
            src: img.src,
            variant_ids: img.variant_ids || [],
        }))
    }

    if (data.media?.nodes) {
        return data.media.nodes
            .filter((node) => node.image)
            .map((node) => ({
                alt: node.image!.altText,
                src: node.image!.url,
                variant_ids: [],
            }))
    }

    return []
}
