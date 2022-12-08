import React from 'react'
import {BigCommerceCartLineItem} from 'models/integration/types'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import css from './OrderLineItemRow.less'

type Props = {
    lineItem: BigCommerceCartLineItem
    currencyCode: Maybe<string>
}
export default function PriceComponent({lineItem, currencyCode}: Props) {
    const price = String(lineItem.list_price)
    return (
        <td className={css.numberCol}>
            <MoneyAmount
                renderIfZero
                amount={price}
                currencyCode={currencyCode ? currencyCode : null}
            />
        </td>
    )
}
