import React, {PureComponent} from 'react'
import {Table} from 'reactstrap'
import {fromJS, List, Map as ImmutableMap} from 'immutable'
import hash from 'object-hash'

import {DraftOrderLineItemRow} from './DraftOrderLineItemRow'
import css from './DraftOrderTable.less'

type Props = {
    shopName: string
    actionName: string
    currencyCode: string
    lineItems: List<any>
    products: Map<number, ImmutableMap<any, any>>
    onChange: (lineItems: List<any>) => void
}

export default class DraftOrderTable extends PureComponent<Props> {
    static defaultProps = {
        products: fromJS({}),
    }

    _onLineItemChange = (
        index: number,
        updatedLineItem: ImmutableMap<any, any>
    ) => {
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
        const {
            lineItems,
            products,
            shopName,
            actionName,
            currencyCode,
        } = this.props

        return (
            <Table hover={!!lineItems.size} className={css.table}>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>In stock</th>
                        <th>Item price</th>
                        <th>Qty</th>
                        <th>Item total</th>
                    </tr>
                </thead>
                <tbody>
                    {!lineItems.size && (
                        <tr>
                            <td colSpan={4} className="text-center text-muted">
                                <small>No items</small>
                            </td>
                        </tr>
                    )}
                    {lineItems.map(
                        (lineItem: ImmutableMap<any, any>, index) => {
                            let keyObject = lineItem.remove('quantity')
                            if (keyObject.get('applied_discount')) {
                                keyObject = keyObject.removeIn([
                                    'applied_discount',
                                    'amount',
                                ])
                            }

                            const key = hash(keyObject)

                            return (
                                <DraftOrderLineItemRow
                                    key={key}
                                    id={key}
                                    actionName={actionName}
                                    lineItem={lineItem}
                                    product={products.get(
                                        lineItem.get('product_id') as number
                                    )}
                                    shopName={shopName}
                                    currencyCode={currencyCode}
                                    removable={lineItems.size > 1}
                                    onChange={(updatedLineItem) =>
                                        this._onLineItemChange(
                                            index as number,
                                            updatedLineItem
                                        )
                                    }
                                    onDelete={() =>
                                        this._onLineItemDelete(index as number)
                                    }
                                />
                            )
                        }
                    )}
                </tbody>
            </Table>
        )
    }
}
