import React from 'react'
import {
    BigCommerceCartLineItem,
    BigCommerceCustomCartLineItem,
} from 'models/integration/types'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'

import {isBigCommerceCartLineItem} from '../../utils'
import css from './OrderLineItemRow.less'

type Props = {
    currencyCode: Maybe<string>
    lineItem: BigCommerceCartLineItem | BigCommerceCustomCartLineItem
}

export function TotalPriceComponent({currencyCode, lineItem}: Props) {
    const price = isBigCommerceCartLineItem(lineItem)
        ? lineItem.extended_sale_price // Line Item
        : lineItem.extended_list_price // Custom Line Item

    return (
        <td className={css.numberCol}>
            <MoneyAmount
                renderIfZero
                amount={String(price)}
                currencyCode={currencyCode ? currencyCode : null}
            />
        </td>
    )
}
