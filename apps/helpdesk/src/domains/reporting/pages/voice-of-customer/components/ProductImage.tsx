import { useState } from 'react'

import fallbackImage from 'domains/reporting/assets/img/no-product.png'
import css from 'domains/reporting/pages/voice-of-customer/components/ProductImage.less'

const imageSize = {
    md: 48,
    lg: 64,
}

type ImageSize = keyof typeof imageSize

export const ProductImage = ({
    src = fallbackImage,
    alt,
    size = 'md',
}: {
    src?: string
    alt: string
    size?: ImageSize
}) => {
    const [isError, setIsError] = useState(false)
    const imageSource = isError ? fallbackImage : src
    return (
        <div
            style={{ width: imageSize[size], height: imageSize[size] }}
            className={css.productImage}
        >
            <img src={imageSource} alt={alt} onError={() => setIsError(true)} />
        </div>
    )
}
