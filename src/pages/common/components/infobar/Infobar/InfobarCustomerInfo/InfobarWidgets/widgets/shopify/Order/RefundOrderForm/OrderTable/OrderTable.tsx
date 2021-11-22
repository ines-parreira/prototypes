import React, {memo, useCallback} from 'react'
import {Table} from 'reactstrap'
import {List, Map} from 'immutable'

import OrderLineItemRow from './OrderLineItemRow'
import css from './OrderTable.less'

type Props = {
    shopName: string
    currencyCode: string
    shopCurrencyCode: string
    refund: Map<string, any> | null
    lineItems: List<Map<string, any>>
    onLineItemChange: (lineItem: Map<string, any>, index: number) => void
}

function OrderTable({
    onLineItemChange,
    lineItems,
    refund,
    shopName,
    currencyCode,
    shopCurrencyCode,
}: Props) {
    // if an order item is in the refund list and has no location_id,
    // then it is not possible to restock it. Otherwise yes
    const checkIfRestockable = useCallback(
        (lineItem: Map<string, any>) => {
            if (!refund) return true

            const refundLineItem = (
                refund.get('refund_line_items', []) as List<Map<string, any>>
            ).find(
                (refundLineItem) =>
                    refundLineItem?.get('line_item_id') === lineItem.get('id')
            )
            if (refundLineItem && !refundLineItem.get('location_id')) {
                return false
            }
            return true
        },
        [refund]
    )
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
                    if (!lineItem) return
                    const productId = lineItem.get('product_id') as string
                    const variantId = lineItem.get('variant_id') as string
                    const uid = `${productId || ''}${
                        variantId ? `_${variantId}` : ''
                    }`
                    return (
                        <OrderLineItemRow
                            key={uid}
                            index={index as number}
                            lineItem={lineItem}
                            isRestockable={checkIfRestockable(lineItem)}
                            shopName={shopName}
                            currencyCode={currencyCode}
                            shopCurrencyCode={shopCurrencyCode}
                            onChange={onLineItemChange}
                        />
                    )
                })}
            </tbody>
        </Table>
    )
}

export default memo(OrderTable)
