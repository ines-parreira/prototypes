import React from 'react'

import classNames from 'classnames'

import { BigCommerceOrderProduct } from 'models/integration/types'
import bigcommerceLineItemRowCss from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/AddOrderModal/components/order-table/OrderLineItemRow.less'

type Props = {
    product: BigCommerceOrderProduct
    isDisabled?: boolean
}

export function GiftWrappingComponent({ product, isDisabled = false }: Props) {
    const renderImage = () => {
        return <i className="material-icons">redeem</i>
    }

    const renderTitle = () => {
        return (
            <div>
                <a
                    className={classNames(bigcommerceLineItemRowCss.title, {
                        [bigcommerceLineItemRowCss.isDisabled]: isDisabled,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i className={classNames('material-icons')}>
                        subdirectory_arrow_right
                    </i>
                    {product.wrapping_name}
                </a>
            </div>
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
            </div>
        </td>
    )
}
