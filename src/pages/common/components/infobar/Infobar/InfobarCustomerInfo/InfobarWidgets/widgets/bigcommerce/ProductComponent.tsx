import React, {useCallback} from 'react'
import defaultImage from '../../../../../../../../../assets/img/presentationals/shopify-product-default-image.png'
import css from './OrderLineItemRow.less'
import {LineItem, Product, Variant} from './types'
import {ProductStockQuantity} from './ProductStockQuantity'

type Props = {
    product?: Product
    lineItem: LineItem
    storeHash: string
}
export default function ProductComponent({
    product,
    lineItem,
    storeHash,
}: Props) {
    const sku = lineItem.sku
    const renderImage = () => {
        const src =
            !!product && product.image_url ? product.image_url : defaultImage

        return (
            <img
                className={css.img}
                src={src}
                alt={product ? product.name : ''}
            />
        )
    }

    const renderTitle = useCallback(() => {
        const productId = lineItem.product_id
        if (!productId) {
            return (
                <div>
                    <span className={css.title}>{lineItem.name}</span>
                </div>
            )
        }

        const href = `https://store-${storeHash}.mybigcommerce.com/manage/products/edit/${productId}/`

        return (
            <div>
                <a
                    className={css.title}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {lineItem.name}
                </a>
            </div>
        )
    }, [lineItem, storeHash])

    const renderStock = useCallback(() => {
        const variantId = lineItem.variant_id
        const variant = !!product
            ? product.variants.find(
                  (variant: Variant) => variant.id === variantId
              )
            : null

        return (
            <div className={css.numberCol}>
                {!!product && !!variant && !!product.inventory_tracking ? (
                    <ProductStockQuantity value={variant.inventory_level} />
                ) : (
                    <span className="text-muted">N/A</span>
                )}
            </div>
        )
    }, [product, lineItem])

    return (
        <td className={css.container}>
            <div className={css.imgContainer}>{renderImage()}</div>
            <div className={css.legend}>
                {renderTitle()}
                {!!sku && <div className={css.subtitle}>SKU: {sku}</div>}
                {<div className={css.subtitle}>{renderStock()}</div>}
            </div>
        </td>
    )
}
