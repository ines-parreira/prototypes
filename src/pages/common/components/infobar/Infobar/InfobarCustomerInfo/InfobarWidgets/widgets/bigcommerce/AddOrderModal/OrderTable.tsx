import React, {memo} from 'react'
import {Table} from 'reactstrap'

import {BigCommerceCartLineItem} from 'models/integration/types'

import OrderLineItemRow from './OrderLineItemRow'
import css from './OrderTable.less'

type Props = {
    storeHash: string
    currencyCode: string | undefined
    lineItems: Array<any>
    products?: Map<number, any>
    lineItemWithErrorId?: string
    onLineItemDelete: (index: number) => void
    onLineItemUpdate: (
        index: number,
        newQuantity: number,
        setQuantity: (quantity: number) => void
    ) => void
}
function OrderTable({
    lineItems = [],
    products = new Map(),
    lineItemWithErrorId = '',
    storeHash,
    currencyCode,
    onLineItemUpdate,
    onLineItemDelete,
}: Props) {
    return (
        <Table hover={!!lineItems.length} className={css.table}>
            <thead>
                <tr>
                    <th>Product</th>
                    <th className="text-right">Price</th>
                    <th>Qty</th>
                    <th className="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                {!lineItems.length && (
                    <tr>
                        <td colSpan={4} className="text-center text-muted">
                            <small>No items</small>
                        </td>
                    </tr>
                )}
                {lineItems.map((lineItem: BigCommerceCartLineItem, index) => {
                    const hasError = lineItemWithErrorId === lineItem.id
                    const productId = lineItem.product_id
                    const variantId = lineItem.variant_id
                    const uid = `${productId}${
                        variantId ? `_${variantId}` : ''
                    }`
                    return (
                        <OrderLineItemRow
                            key={uid}
                            id={uid}
                            index={index}
                            lineItem={lineItem}
                            product={products.get(lineItem.product_id)}
                            storeHash={storeHash}
                            currencyCode={currencyCode}
                            removable={lineItems.length > 1}
                            onDelete={onLineItemDelete}
                            onChange={onLineItemUpdate}
                            hasError={hasError}
                        />
                    )
                })}
            </tbody>
        </Table>
    )
}
export default memo(OrderTable)
