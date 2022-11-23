import React from 'react'
import classnames from 'classnames'
import {getSizedImageUrl} from '@shopify/theme-images'

import defaultImage from 'assets/img/presentationals/shopify-product-default-image.png'
import {IntegrationType} from 'models/integration/constants'
import {ProductStockQuantity} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/shared/StockQuantity'

import css from './Result.less'

export type Props = {
    image: {src?: string; alt?: string; type?: IntegrationType} | null
    title: string
    subtitle: string | null
    stock: {
        tracked: boolean
        quantity: number | null
        totalVariants?: number
    }
}

export default function Result({image, title, subtitle, stock}: Props) {
    let imageSrc = !!image ? image.src : defaultImage
    if (image && image.src && image.type === IntegrationType.Shopify) {
        imageSrc = getSizedImageUrl(image.src, 'small')
    }
    imageSrc = imageSrc || defaultImage
    const imageAlt = !!image ? image.alt : ''

    return (
        <div className={css.container}>
            <div className={css.imgContainer}>
                <img className={css.img} src={imageSrc} alt={imageAlt} />
            </div>
            <div className={css.legend}>
                <div className={css.title}>{title}</div>
                {subtitle && <div className={css.subtitle}>{subtitle}</div>}
            </div>
            {stock.tracked ? (
                <div className={css.stock}>
                    <ProductStockQuantity value={stock.quantity!} /> in stock{' '}
                    {stock.totalVariants && stock.totalVariants > 1
                        ? `for ${stock.totalVariants} variants`
                        : null}
                </div>
            ) : (
                <div className={classnames(css.stock, css.grey)}>
                    Inventory not tracked
                </div>
            )}
        </div>
    )
}
