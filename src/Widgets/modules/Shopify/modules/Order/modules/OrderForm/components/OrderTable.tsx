import {Tooltip} from '@gorgias/merchant-ui-kit'
import classnames from 'classnames'
import {List, Map} from 'immutable'
import React, {memo, useCallback} from 'react'
import {Table} from 'reactstrap'

import {FulfillmentStatus} from 'constants/integrations/types/shopify'

import OrderLineItemRow from './OrderLineItemRow'
import css from './OrderTable.less'

type Props = {
    shopName: string
    currencyCode: string
    fulfillmentStatus: FulfillmentStatus | null
    refund: Map<string, any> | null
    lineItems: List<Map<string, any>>
    onLineItemChange: (lineItem: Map<string, any>, index: number) => void
    keepLineItemQuantityAsDefault?: boolean
    hasMultipleGateways: boolean
}

function OrderTable({
    onLineItemChange,
    lineItems,
    fulfillmentStatus,
    refund,
    shopName,
    currencyCode,
    keepLineItemQuantityAsDefault = true,
    hasMultipleGateways,
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

    const showQtyWarningIcon =
        !fulfillmentStatus || fulfillmentStatus === FulfillmentStatus.Partial

    return (
        <Table hover className={classnames(css.table, 'mb-4')}>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Item price</th>
                    <th>
                        <div className={css.qty}>
                            Qty
                            {showQtyWarningIcon ? (
                                <>
                                    <span
                                        className="material-icons orange ml-1"
                                        id="qty-warning-icon"
                                        aria-label="Quantity warning"
                                    >
                                        warning
                                    </span>
                                    <Tooltip
                                        placement="top"
                                        target="qty-warning-icon"
                                    >
                                        All unfulfilled items with QTY other
                                        than 0 will be removed from the order.
                                    </Tooltip>
                                </>
                            ) : null}
                        </div>
                    </th>
                    <th className={css.itemTotal}>Item total</th>
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
                            onChange={onLineItemChange}
                            keepLineItemQuantityAsDefault={
                                keepLineItemQuantityAsDefault
                            }
                            hasMultipleGateways={hasMultipleGateways}
                        />
                    )
                })}
            </tbody>
        </Table>
    )
}

export default memo(OrderTable)
