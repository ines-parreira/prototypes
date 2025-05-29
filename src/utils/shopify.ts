import defaultImage from 'assets/img/presentationals/shopify-product-default-image.png'
import { IntegrationType } from 'models/integration/constants'

export const getSizedImageUrl = (src: string, size: string) => {
    const match = src.match(
        /\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif|webp)(\?v=\d+)?$/i,
    )

    if (match) {
        const prefix = src.split(match[0])
        const suffix = match[0]

        return `${prefix[0]}_${size}${suffix}`.replace(/http(s)?:/, '')
    }
    return null
}

export const getImageSrc = (
    image: { src?: string; alt?: string; type?: IntegrationType } | null,
) => {
    let imageSrc = image?.src || ''

    if (image?.src && image.type === IntegrationType.Shopify) {
        imageSrc = getSizedImageUrl(image.src, 'small') || ''
    }

    return imageSrc || (defaultImage as string)
}
