// @flow

import React from 'react'
import {Table} from 'reactstrap'
import {type List, type Record} from 'immutable'
import hash from 'object-hash'

import type {
    Refund,
    LineItem,
} from '../../../../../../../../../../../../constants/integrations/types/shopify'

import {OrderLineItemRow} from './OrderLineItemRow'
import css from './OrderTable.less'

type Props = {
    shopName: string,
    currencyCode: string,
    shopCurrencyCode: string,
    refund: ?Record<Refund>,
    lineItems: List<$Shape<LineItem>>,
    onChange: (lineItems: List<$Shape<LineItem>>) => void,
}

export default class OrderTable extends React.PureComponent<Props> {
    _onLineItemChange = (index: number, updatedLineItem: Record<LineItem>) => {
        const {onChange, lineItems} = this.props
        const newLineItems = lineItems.set(index, updatedLineItem)

        onChange(newLineItems)
    }

    render() {
        const {
            lineItems,
            refund,
            shopName,
            currencyCode,
            shopCurrencyCode,
        } = this.props

        return (
            <Table hover className={css.table}>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Item price</th>
                        <th>Qty</th>
                        <th>Item total</th>
                    </tr>
                </thead>
                <tbody>
                    {lineItems.map((lineItem, index) => {
                        const keyObject = lineItem.remove('quantity')
                        const key = hash(keyObject)

                        return (
                            <OrderLineItemRow
                                key={key}
                                lineItem={lineItem}
                                refund={refund}
                                shopName={shopName}
                                currencyCode={currencyCode}
                                shopCurrencyCode={shopCurrencyCode}
                                onChange={(updatedLineItem) =>
                                    this._onLineItemChange(
                                        index,
                                        updatedLineItem
                                    )
                                }
                            />
                        )
                    })}
                </tbody>
            </Table>
        )
    }
}
