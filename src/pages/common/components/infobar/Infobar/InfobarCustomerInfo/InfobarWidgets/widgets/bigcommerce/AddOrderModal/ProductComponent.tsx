import React, {useCallback} from 'react'
import {
    BigCommerceCartLineItem,
    BigCommerceCustomCartLineItem,
    BigCommerceProduct,
    BigCommerceCustomProduct,
    BigCommerceProductVariant,
} from 'models/integration/types'
import defaultImage from 'assets/img/presentationals/shopify-product-default-image.png'
import {ProductStockQuantity} from './ProductStockQuantity'
import css from './OrderLineItemRow.less'
import {isBigCommerceCartLineItem, isBigCommerceProduct} from './utils'

type Props = {
    product?: BigCommerceProduct | BigCommerceCustomProduct
    lineItem: BigCommerceCartLineItem | BigCommerceCustomCartLineItem
    storeHash: string
}
const StockNotAvailable = () => <span className="text-muted">N/A</span>

export default function ProductComponent({
    product,
    lineItem,
    storeHash,
}: Props) {
    const sku = lineItem.sku
    const renderImage = () => {
        let src

        if (product && isBigCommerceProduct(product)) {
            // Product
            src =
                !!product && product.image_url
                    ? product.image_url
                    : defaultImage
        } else {
            // Custom Product - use the default image
            src = defaultImage
        }

        return (
            <img
                className={css.img}
                src={src}
                alt={product ? product.name : ''}
            />
        )
    }

    const renderTitle = useCallback(() => {
        const productId = isBigCommerceCartLineItem(lineItem)
            ? lineItem.product_id
            : null

        if (!productId) {
            // Custom Line Item
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
        if (
            !isBigCommerceCartLineItem(lineItem) ||
            (product && !isBigCommerceProduct(product))
        ) {
            // Custom Product + Custom Line Item
            return <StockNotAvailable />
        }

        const variantId = lineItem.variant_id
        const variant = !!product
            ? product.variants.find(
                  (variant: BigCommerceProductVariant) =>
                      variant.id === variantId
              )
            : null

        if (!product || !variant) {
            return <StockNotAvailable />
        }

        const isTracked = ['variant', 'product'].includes(
            product.inventory_tracking
        )

        if (!isTracked) {
            return <StockNotAvailable />
        }

        return (
            <div>
                <ProductStockQuantity
                    value={
                        product.inventory_tracking === 'variant'
                            ? variant.inventory_level
                            : product.inventory_level
                    }
                />
            </div>
        )
    }, [product, lineItem])

    return (
        <td className={css.descriptionCol}>
            <div className={css.imgContainer}>{renderImage()}</div>
            <div className={css.legend}>
                {renderTitle()}
                {!!sku && <div className={css.subtitle}>SKU: {sku}</div>}
                {<div className={css.subtitle}>{renderStock()}</div>}
            </div>
        </td>
    )
}
