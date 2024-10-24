import classNames from 'classnames'
import React from 'react'

import bigcommerceLineItemRowCss from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/AddOrderModal/components/order-table/OrderLineItemRow.less'

type Props = {
    initialQuantity: number
    availableQuantity: number
    refundedQuantity: number
    isDisabled?: boolean
}

export function QuantityComponent({
    initialQuantity,
    availableQuantity,
    refundedQuantity,
    isDisabled = false,
}: Props) {
    return (
        <td>
            <div
                className={classNames(
                    bigcommerceLineItemRowCss.quantityColSmall,
                    {
                        [bigcommerceLineItemRowCss.isDisabled]: isDisabled,
                    }
                )}
            >
                <span>{availableQuantity}</span>
            </div>
            {refundedQuantity > 0 && (
                <div
                    className={
                        bigcommerceLineItemRowCss.refundedQuantityDescription
                    }
                >
                    <span>{`${refundedQuantity}/${initialQuantity} refunded`}</span>
                </div>
            )}
        </td>
    )
}
