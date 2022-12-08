import classnames from 'classnames'
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
            <div className="d-flex">
                <strong className={classnames('mt-auto mb-auto', 'mr-auto')}>
                    <MoneyAmount
                        renderIfZero
                        amount={String(lineItem.extended_sale_price)}
                        currencyCode={currencyCode ? currencyCode : null}
                    />
                </strong>
            </div>
        </td>
    )
}
