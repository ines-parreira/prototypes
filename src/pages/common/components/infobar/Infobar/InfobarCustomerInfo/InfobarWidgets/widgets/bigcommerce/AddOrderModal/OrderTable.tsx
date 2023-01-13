import React, {memo} from 'react'
import {Table} from 'reactstrap'

import {
    BigCommerceCreateOrderErrorType,
    BigCommerceCartLineItem,
    BigCommerceCustomCartLineItem,
    BigCommerceProductsListType,
} from 'models/integration/types'

import OrderLineItemRow from './OrderLineItemRow'
import css from './OrderTable.less'
import {isBigCommerceCartLineItem} from './utils'

type Props = {
    storeHash: string
    currencyCode: string | undefined
    lineItems: Array<BigCommerceCartLineItem | BigCommerceCustomCartLineItem>
    products?: BigCommerceProductsListType
    lineItemWithError?: BigCommerceCreateOrderErrorType
    onLineItemDelete: (index: number) => void
    onLineItemUpdate: (
        index: number,
        newQuantity: number,
        setQuantity: (quantity: number) => void
    ) => void
}

function getOrderLineItemInfo(
    lineItem: BigCommerceCartLineItem | BigCommerceCustomCartLineItem,
    products: BigCommerceProductsListType
) {
    let uid, product

    if (isBigCommerceCartLineItem(lineItem)) {
        // Line Item
        const productId = lineItem.product_id
        const variantId = lineItem.variant_id
        uid = `${productId}${variantId ? `_${variantId}` : ''}`
        product = products.get(lineItem.product_id)
    } else {
        // Custom Line Item
        uid = lineItem.id
        product = products.get(lineItem.id)
    }

    return {uid, product}
}

function OrderTable({
    lineItems = [],
    products = new Map(),
    lineItemWithError = {id: null, message: ''},
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
                {lineItems.map((lineItem, index) => {
                    const hasError = lineItemWithError.id === lineItem.id

                    const {uid, product} = getOrderLineItemInfo(
                        lineItem,
                        products
                    )

                    return (
                        <OrderLineItemRow
                            key={uid}
                            id={uid}
                            index={index}
                            lineItem={lineItem}
                            product={product}
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
