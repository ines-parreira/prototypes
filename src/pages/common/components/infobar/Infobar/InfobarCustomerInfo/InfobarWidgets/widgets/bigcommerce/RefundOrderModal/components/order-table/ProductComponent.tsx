import classNames from 'classnames'
import React from 'react'

import defaultProductImage from 'assets/img/presentationals/shopify-product-default-image.png'
import {BigCommerceOrderProduct} from 'models/integration/types'
import bigcommerceLineItemRowCss from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/AddOrderModal/components/order-table/OrderLineItemRow.less'

type Props = {
    product: BigCommerceOrderProduct
    productImage: Maybe<string>
    isDisabled?: boolean
    storeHash: string
}

export function ProductComponent({
    product,
    productImage,
    isDisabled = false,
    storeHash,
}: Props) {
    const sku = product.sku

    const renderImage = () => {
        return (
            <img
                className={bigcommerceLineItemRowCss.img}
                src={productImage || defaultProductImage}
                alt={product ? product.name : ''}
            />
        )
    }

    const renderTitle = () => {
        if (product.product_id === 0) {
            // Custom Product
            return (
                <div>
                    <span
                        className={classNames(bigcommerceLineItemRowCss.title, {
                            [bigcommerceLineItemRowCss.isDisabled]: isDisabled,
                        })}
                    >
                        {product.name}
                    </span>
                </div>
            )
        }
        return (
            <div>
                <a
                    className={classNames(bigcommerceLineItemRowCss.title, {
                        [bigcommerceLineItemRowCss.isDisabled]: isDisabled,
                    })}
                    href={`https://store-${storeHash}.mybigcommerce.com/manage/products/edit/${product.product_id}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {product.name}
                </a>
            </div>
        )
    }

    const renderOptions = () => {
        return (
            <ul className={bigcommerceLineItemRowCss.modifiersList}>
                {product.product_options.map((option) => (
                    <li
                        className={classNames({
                            [bigcommerceLineItemRowCss.isDisabled]: isDisabled,
                        })}
                        key={option.id}
                    >
                        {option.display_value}
                    </li>
                ))}
            </ul>
        )
    }

    return (
        <td className={bigcommerceLineItemRowCss.descriptionColLarge}>
            <div className={bigcommerceLineItemRowCss.imgContainer}>
                {renderImage()}
            </div>
            <div
                className={classNames(bigcommerceLineItemRowCss.legend, {
                    [bigcommerceLineItemRowCss.isDisabled]: isDisabled,
                })}
            >
                {renderTitle()}
                {!!sku && (
                    <div
                        className={classNames(
                            bigcommerceLineItemRowCss.subtitle,
                            {
                                [bigcommerceLineItemRowCss.isDisabled]:
                                    isDisabled,
                            }
                        )}
                    >
                        SKU: {sku}
                    </div>
                )}
                {renderOptions()}
            </div>
        </td>
    )
}
