// @flow

import {type Record} from 'immutable'

import type {Refund, LineItem} from '../../constants/integrations/types/shopify'

export function getSubtotal(refund: Record<Refund>): number {
    return refund
        .get('refund_line_items', [])
        .reduce(
            (total, refundLineItem) =>
                total +
                parseFloat(refundLineItem.get('discounted_price')) *
                    refundLineItem.get('quantity'),
            0
        )
}

export function getTotalCartDiscountAmount(refund: Record<Refund>): number {
    return refund
        .get('refund_line_items', [])
        .reduce(
            (total, refundLineItem) =>
                total +
                parseFloat(refundLineItem.get('total_cart_discount_amount')),
            0
        )
}

export function getTotalTax(refund: Record<Refund>): number {
    return refund
        .get('refund_line_items', [])
        .reduce(
            (total, refundLineItem) =>
                total + parseFloat(refundLineItem.get('total_tax')),
            parseFloat(refund.getIn(['shipping', 'tax'], 0))
        )
}

export function getRefundAmount(refund: Record<Refund>): number {
    return parseFloat(refund.getIn(['transactions', 0, 'amount'], 0))
}

export function getTotalAvailableToRefund(refund: Record<Refund>): number {
    return parseFloat(
        refund.getIn(['transactions', 0, 'maximum_refundable'], 0)
    )
}

export function getTotalQuantities(
    payload: Record<Refund>,
    suggestedRefund: ?Record<Refund>
): number {
    return payload
        .get('refund_line_items', [])
        .reduce((total, refundLineItem) => {
            const quantity = refundLineItem.get('quantity')

            // No suggested refund: all the items are restockable
            if (!suggestedRefund || suggestedRefund.isEmpty()) {
                return total + quantity
            }

            // Restockable items have an associated `location_id` in the suggested refund
            const suggestedRefundLineItem = suggestedRefund
                .get('refund_line_items', [])
                .find(
                    (suggestedRefundLineItem) =>
                        suggestedRefundLineItem.get('line_item_id') ===
                        refundLineItem.get('line_item_id')
                )

            const locationId = suggestedRefundLineItem
                ? suggestedRefundLineItem.get('location_id')
                : null
            return locationId ? total + quantity : total
        }, 0)
}

export function getRestockType(
    lineItem: Record<$Shape<LineItem>>,
    restock: boolean = true
): string {
    if (restock) {
        const isFulfilled = lineItem.get('fulfillment_status') === 'fulfilled'
        return isFulfilled ? 'return' : 'cancel'
    }

    return 'no_restock'
}
