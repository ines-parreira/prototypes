import React from 'react'
import {Table} from 'reactstrap'

import {
    BigCommerceCreateOrderErrorType,
    BigCommerceCartLineItem,
    BigCommerceCustomCartLineItem,
    BigCommerceProductsListType,
} from 'models/integration/types'

import {OptionSelection} from 'models/integration/resources/bigcommerce'
import {isBigCommerceCartLineItem} from '../../utils'

import OrderLineItemRow from './OrderLineItemRow'
import css from './OrderTable.less'

type Props = {
    storeHash: string
    currencyCode: string | undefined
    lineItems: Array<BigCommerceCartLineItem | BigCommerceCustomCartLineItem>
    products?: BigCommerceProductsListType
    lineItemWithError?: BigCommerceCreateOrderErrorType
    onLineItemDiscount: (index: number, newPrice: number) => void
    onLineItemDelete: (index: number) => void
    onLineItemUpdate: (
        index: number,
        quantity: number,
        optionSelections?: OptionSelection[]
    ) => Promise<void>
    onLineItemModifiersUpdate: (props: {
        index: number
        quantity: number
        optionSelections: OptionSelection[]
    }) => Promise<void>
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
        product = products.get(lineItem.product_id)!
    } else {
        // Custom Line Item
        uid = lineItem.id
        product = products.get(lineItem.id)!
    }

    return {uid, product}
}

export default function OrderTable({
    lineItems = [],
    products = new Map(),
    lineItemWithError = {id: null, message: ''},
    storeHash,
    currencyCode,
    onLineItemUpdate,
    onLineItemModifiersUpdate,
    onLineItemDelete,
    onLineItemDiscount,
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
                            onChangeModifiers={onLineItemModifiersUpdate}
                            onLineItemDiscount={onLineItemDiscount}
                            hasError={hasError}
                        />
                    )
                })}
            </tbody>
        </Table>
    )
}
