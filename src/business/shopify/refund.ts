import {Map, List} from 'immutable'

export function getSubtotal(refund: Map<any, any>): number {
    return (refund.get('refund_line_items', []) as List<any>).reduce(
        (total = 0, refundLineItem: Map<any, any>) =>
            total +
            parseFloat(refundLineItem.get('discounted_price')) *
                refundLineItem.get('quantity'),
        0
    )
}

export function getTotalCartDiscountAmount(refund: Map<any, any>): number {
    return (refund.get('refund_line_items', []) as List<any>).reduce(
        (total = 0, refundLineItem: Map<any, any>) =>
            total +
            parseFloat(refundLineItem.get('total_cart_discount_amount')),
        0
    )
}

export function getTotalTax(refund: Map<any, any>): number {
    return (refund.get('refund_line_items', []) as List<any>).reduce(
        (total = 0, refundLineItem: Map<any, any>) =>
            total + parseFloat(refundLineItem.get('total_tax')),
        parseFloat(refund.getIn(['shipping', 'tax'], 0))
    )
}

export function getRefundAmount(refund: Map<any, any>): number {
    return parseFloat(refund.getIn(['transactions', 0, 'amount'], 0))
}

export function getTotalAvailableToRefund(refund: Map<any, any>): number {
    return parseFloat(
        refund.getIn(['transactions', 0, 'maximum_refundable'], 0)
    )
}

export function getTotalQuantities(
    payload: Map<any, any>,
    suggestedRefund: Maybe<Map<any, any>>
): number {
    return (payload.get('refund_line_items', []) as List<any>).reduce(
        (total = 0, refundLineItem: Map<any, any>) => {
            const quantity = refundLineItem.get('quantity') as number

            // No suggested refund: all the items are restockable
            if (!suggestedRefund || suggestedRefund.isEmpty()) {
                return total + quantity
            }

            // Restockable items have an associated `location_id` in the suggested refund
            const suggestedRefundLineItem = (suggestedRefund.get(
                'refund_line_items',
                []
            ) as List<any>).find(
                (suggestedRefundLineItem: Map<any, any>) =>
                    suggestedRefundLineItem.get('line_item_id') ===
                    refundLineItem.get('line_item_id')
            ) as Map<any, any>

            const locationId = suggestedRefundLineItem
                ? (suggestedRefundLineItem.get('location_id') as string)
                : null
            return locationId ? total + quantity : total
        },
        0
    )
}

export function getRestockType(
    lineItem: Map<any, any>,
    restock = true
): string {
    if (restock) {
        const isFulfilled = lineItem.get('fulfillment_status') === 'fulfilled'
        return isFulfilled ? 'return' : 'cancel'
    }

    return 'no_restock'
}
