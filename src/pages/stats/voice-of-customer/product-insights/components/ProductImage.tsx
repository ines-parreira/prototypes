import { useState } from 'react'

import fallbackImage from 'assets/img/stats/no-product.png'
import css from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsCellContent.less'

enum ImageSize {
    md = 48,
}

export const ProductImage = ({
    src = fallbackImage,
    alt,
    size = ImageSize.md,
}: {
    src?: string
    alt: string
    size?: ImageSize
}) => {
    const [isError, setIsError] = useState(false)
    const imageSource = isError ? fallbackImage : src
    return (
        <div style={{ width: size, height: size }} className={css.productImage}>
            <img src={imageSource} alt={alt} onError={() => setIsError(true)} />
        </div>
    )
}
