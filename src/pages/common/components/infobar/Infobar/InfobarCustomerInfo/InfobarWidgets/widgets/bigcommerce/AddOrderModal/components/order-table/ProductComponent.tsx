import classnames from 'classnames'
import React, {useCallback} from 'react'

import errorIcon from 'assets/img/icons/error.svg'
import defaultImage from 'assets/img/presentationals/shopify-product-default-image.png'
import {
    BigCommerceCartLineItem,
    BigCommerceCustomCartLineItem,
    BigCommerceProduct,
    BigCommerceCustomProduct,
    BigCommerceProductVariant,
} from 'models/integration/types'
import {ProductStockQuantity} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/AddOrderModal/ProductStockQuantity'
import {
    isBigCommerceCartLineItem,
    isBigCommerceProduct,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/AddOrderModal/utils'

import css from './OrderLineItemRow.less'

type Props = {
    product?: BigCommerceProduct | BigCommerceCustomProduct
    lineItem: BigCommerceCartLineItem | BigCommerceCustomCartLineItem
    storeHash: string
    onOpenModifiers: () => void
    errorMessage?: Maybe<string>
}
const StockNotAvailable = () => <span className="text-muted">N/A</span>

export const Modifiers = ({
    lineItem,
    product,
    onOpenModifiers,
}: {
    product?: BigCommerceProduct | BigCommerceCustomProduct
    lineItem: BigCommerceCartLineItem | BigCommerceCustomCartLineItem
    onOpenModifiers: () => void
}) => {
    if (!isBigCommerceCartLineItem(lineItem)) {
        return null
    }

    if (
        !product ||
        !isBigCommerceProduct(product) ||
        !product.modifiers?.length
    ) {
        return null
    }

    const viewableModifiers = lineItem.options
        .map((option) => {
            const modifier = (product.modifiers ?? []).find(({id}) => {
                if ('nameId' in option) {
                    return option.nameId === id
                }

                return option.name_id === id
            })

            if (!modifier) {
                return null
            }

            // Display checkbox value as name of the checkbox, instead of yes/no
            if (modifier.type === 'checkbox') {
                return {id: modifier.id, value: modifier.display_name}
            }

            return {id: modifier.id, value: option.value}
        })
        .filter(<T,>(value: T): value is NonNullable<T> => value !== null)

    return (
        <>
            {viewableModifiers.length ? (
                <ul className={css.modifiersList}>
                    {viewableModifiers.map((modifier) => (
                        <li key={modifier.id}>{modifier.value}</li>
                    ))}
                </ul>
            ) : null}
            <button onClick={onOpenModifiers} className={css.modifierButton}>
                <i className={classnames('material-icons')}>tune</i>
                Modify
            </button>
        </>
    )
}

export const getVariant = (
    lineItem: BigCommerceCartLineItem | BigCommerceCustomCartLineItem,
    product?: BigCommerceProduct | BigCommerceCustomProduct
) => {
    if (
        !isBigCommerceCartLineItem(lineItem) ||
        !product ||
        !isBigCommerceProduct(product)
    ) {
        return null
    }

    return (
        product.variants.find(
            (variant: BigCommerceProductVariant) =>
                variant.id === lineItem.variant_id
        ) || null
    )
}

export default function ProductComponent({
    product,
    lineItem,
    storeHash,
    onOpenModifiers,
    errorMessage,
}: Props) {
    const sku = lineItem.sku
    const renderImage = useCallback(() => {
        const variant = getVariant(lineItem, product)
        const src = variant?.image_url || product?.image_url || defaultImage

        return (
            <img
                className={css.img}
                src={src}
                alt={product ? product.name : ''}
            />
        )
    }, [product, lineItem])

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

        const variant = getVariant(lineItem, product)

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
                <Modifiers
                    lineItem={lineItem}
                    product={product}
                    onOpenModifiers={onOpenModifiers}
                />
                {errorMessage && (
                    <div className={`mt-3 ${css.errorRow}`}>
                        <img src={errorIcon} alt="icon" />
                        <span className="ml-3">{errorMessage}</span>
                    </div>
                )}
            </div>
        </td>
    )
}
