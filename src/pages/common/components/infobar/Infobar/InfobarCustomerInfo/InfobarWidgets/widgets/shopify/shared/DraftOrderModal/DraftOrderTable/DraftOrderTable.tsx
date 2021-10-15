import React, {memo} from 'react'
import {Table} from 'reactstrap'
import {fromJS, List, Map as ImmutableMap} from 'immutable'

import {ShopifyActionType} from '../../../types'

import DraftOrderLineItemRow from './DraftOrderLineItemRow'
import css from './DraftOrderTable.less'

type Props = {
    shopName: string
    isShownInEditOrder: boolean
    actionName: ShopifyActionType
    currencyCode: string
    lineItems: List<any>
    products?: Map<number, ImmutableMap<any, any>>
    onLineItemUpdate: (record: ImmutableMap<any, any>, index: number) => void
    onLineItemDelete: (index: number) => void
}
function DraftOrderTable({
    lineItems,
    products = fromJS({}),
    shopName,
    isShownInEditOrder,
    actionName,
    currencyCode,
    onLineItemUpdate,
    onLineItemDelete,
}: Props): JSX.Element {
    return (
        <Table hover={!!lineItems.size} className={css.table}>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>In stock</th>
                    <th>Item price</th>
                    <th>Qty</th>
                    <th>Item total</th>
                    {isShownInEditOrder && <th>Remove/Restock</th>}
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
                {lineItems.map((lineItem: ImmutableMap<any, any>, index) => {
                    const productId = lineItem.get('product_id') as string
                    const variantId = lineItem.get('variant_id') as string
                    const uid = `${productId}${
                        variantId ? `_${variantId}` : ''
                    }`
                    return (
                        <DraftOrderLineItemRow
                            key={uid}
                            id={uid}
                            index={index as number}
                            actionName={actionName}
                            isShownInEditOrder={isShownInEditOrder}
                            lineItem={lineItem}
                            product={products.get(
                                lineItem.get('product_id') as number
                            )}
                            shopName={shopName}
                            currencyCode={currencyCode}
                            removable={lineItems.size > 1}
                            onChange={onLineItemUpdate}
                            onDelete={onLineItemDelete}
                        />
                    )
                })}
            </tbody>
        </Table>
    )
}
export default memo(DraftOrderTable)
