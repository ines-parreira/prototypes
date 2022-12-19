import React from 'react'
import {BigCommerceCartLineItem} from 'models/integration/types'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'

import css from './OrderLineItemRow.less'

type Props = {
    currencyCode: Maybe<string>
    lineItem: BigCommerceCartLineItem
}

export function TotalPriceComponent({currencyCode, lineItem}: Props) {
    return (
        <td className={css.numberCol}>
            <MoneyAmount
                renderIfZero
                amount={String(lineItem.extended_sale_price)}
                currencyCode={currencyCode ? currencyCode : null}
            />
        </td>
    )
}
