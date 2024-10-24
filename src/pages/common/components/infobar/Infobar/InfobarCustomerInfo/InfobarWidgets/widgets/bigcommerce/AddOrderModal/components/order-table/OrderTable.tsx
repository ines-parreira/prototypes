import React from 'react'
import {Table} from 'reactstrap'

import {OptionSelection} from 'models/integration/resources/bigcommerce'
import {
    BigCommerceCartLineItem,
    BigCommerceCustomCartLineItem,
    BigCommerceProductsListType,
} from 'models/integration/types'

import {computeLineItemErrorKey} from '../../utils'

import OrderLineItemRow from './OrderLineItemRow'
import css from './OrderTable.less'
import {getOrderLineItemInfo} from './utils'

type Props = {
    storeHash: string
    currencyCode: string | undefined
    lineItems: Array<BigCommerceCartLineItem | BigCommerceCustomCartLineItem>
    products?: BigCommerceProductsListType
    lineItemsWithErrors?: Map<string, string | null>
    onLineItemDiscount: (
        index: number,
        newPrice: number,
        action: 'add' | 'remove'
    ) => void
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
        discounts: Map<string, number>
        setDiscounts: (value: Map<string, number>) => void
    }) => Promise<void>
    discounts: Map<string, number>
    setDiscounts: (value: Map<string, number>) => void
}

export default function OrderTable({
    lineItems = [],
    products = new Map(),
    lineItemsWithErrors = new Map(),
    storeHash,
    currencyCode,
    onLineItemUpdate,
    onLineItemModifiersUpdate,
    onLineItemDelete,
    onLineItemDiscount,
    discounts,
    setDiscounts,
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
                    const lineItemErrorMessage = lineItemsWithErrors?.get(
                        computeLineItemErrorKey({lineItem: lineItem})
                    )
                    const hasError = !!lineItemErrorMessage
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
                            errorMessage={lineItemErrorMessage}
                            discounts={discounts}
                            setDiscounts={setDiscounts}
                        />
                    )
                })}
            </tbody>
        </Table>
    )
}
