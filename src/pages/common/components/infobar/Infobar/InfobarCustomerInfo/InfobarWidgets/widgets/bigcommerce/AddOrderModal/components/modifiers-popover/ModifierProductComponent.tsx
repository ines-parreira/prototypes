import React, {useCallback} from 'react'
import {BigCommerceProduct} from 'models/integration/types'

import defaultImage from 'assets/img/presentationals/shopify-product-default-image.png'

import css from './ModifierProductComponent.less'

type Props = {
    product: BigCommerceProduct
    sku?: string
    storeHash: string
}

export const ModifierProductComponent = ({product, sku, storeHash}: Props) => {
    const renderTitle = useCallback(() => {
        const productId = product.id

        const href = `https://store-${storeHash}.mybigcommerce.com/manage/products/edit/${productId}/`

        return (
            <a
                className={css.title}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
            >
                {product.name}
            </a>
        )
    }, [product.id, product.name, storeHash])

    return (
        <div className={css.container}>
            <div className={css.imgContainer}>
                <img
                    className={css.img}
                    src={product.image_url ? product.image_url : defaultImage}
                    alt={product ? product.name : ''}
                />
            </div>
            <div>
                {renderTitle()}
                {!!sku && <div className={css.subTitle}>SKU: {sku}</div>}
            </div>
        </div>
    )
}
