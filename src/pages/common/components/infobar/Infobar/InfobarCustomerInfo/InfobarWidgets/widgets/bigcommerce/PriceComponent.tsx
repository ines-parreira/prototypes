import React from 'react'
import MoneyAmount from '../MoneyAmount'
import css from './OrderLineItemRow.less'
import {LineItem} from './types'

type Props = {
    lineItem: LineItem
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
