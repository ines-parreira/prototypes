import classnames from 'classnames'
import React from 'react'
import MoneyAmount from '../MoneyAmount'
import {LineItem} from './types'
import css from './OrderLineItemRow.less'

type Props = {
    currencyCode: Maybe<string>
    lineItem: LineItem
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
