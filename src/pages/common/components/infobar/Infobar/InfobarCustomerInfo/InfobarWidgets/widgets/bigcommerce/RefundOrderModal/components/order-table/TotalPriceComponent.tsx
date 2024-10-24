import classNames from 'classnames'
import React from 'react'

import bigcommerceLineItemRowCss from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/AddOrderModal/components/order-table/OrderLineItemRow.less'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'

type Props = {
    price: string
    isDisabled?: boolean
    currencyCode: Maybe<string>
}

export function TotalPriceComponent({
    price,
    isDisabled = false,
    currencyCode,
}: Props) {
    return (
        <td>
            <div
                className={classNames(
                    bigcommerceLineItemRowCss.numberColSmall,
                    {
                        [bigcommerceLineItemRowCss.isDisabled]: isDisabled,
                    }
                )}
            >
                <MoneyAmount
                    renderIfZero
                    amount={price}
                    currencyCode={currencyCode ? currencyCode : null}
                />
            </div>
        </td>
    )
}
