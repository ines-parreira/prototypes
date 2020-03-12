// @flow

import React from 'react'
import {Table} from 'reactstrap'
import {type List, type Record} from 'immutable'
import hash from 'object-hash'

import * as Shopify from '../../../../../../../../../../../../constants/integrations/shopify'

import {DraftOrderLineItemRow} from './DraftOrderLineItemRow'
import css from './DraftOrderTable.less'

type Props = {
    shopName: string,
    currencyCode: string,
    lineItems: List<$Shape<Shopify.LineItem>>,
    products: Map<number, Record<Shopify.Product>>,
    onChange: (lineItems: List<$Shape<Shopify.LineItem>>) => void,
}

export default class DraftOrderTable extends React.PureComponent<Props> {
    static defaultProps = {
        products: new Map<number, Record<Shopify.Product>>(),
    }

    _onLineItemChange = (index: number, updatedLineItem: Record<Shopify.LineItem>) => {
        const {onChange, lineItems} = this.props
        const newLineItems = lineItems.set(index, updatedLineItem)

        onChange(newLineItems)
    }

    _onLineItemDelete = (index: number) => {
        const {onChange, lineItems} = this.props
        const newLineItems = lineItems.remove(index)

        onChange(newLineItems)
    }

    render() {
        const {lineItems, products, shopName, currencyCode} = this.props

        return (
            <Table
                hover
                className={css.table}
            >
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
                        let keyObject = lineItem.remove('quantity')
                        if (keyObject.get('applied_discount')) {
                            keyObject = keyObject.removeIn(['applied_discount', 'amount'])
                        }

                        const key = hash(keyObject)

                        return (
                            <DraftOrderLineItemRow
                                key={key}
                                id={key}
                                lineItem={lineItem}
                                product={products.get(lineItem.get('product_id'))}
                                shopName={shopName}
                                currencyCode={currencyCode}
                                removable={lineItems.size > 1}
                                onChange={(updatedLineItem) => this._onLineItemChange(index, updatedLineItem)}
                                onDelete={() => this._onLineItemDelete(index)}
                            />
                        )
                    })}
                </tbody>
            </Table>
        )
    }
}
