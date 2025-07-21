import { List, Map } from 'immutable'

export function getSubtotal(refund: Map<any, any>): number {
    return (refund.get('refund_line_items', []) as List<any>).reduce(
        (total = 0, refundLineItem: Map<any, any>) =>
            total +
            parseFloat(refundLineItem.get('discounted_price')) *
                refundLineItem.get('quantity'),
        0,
    )
}

export function getTotalCartDiscountAmount(refund: Map<any, any>): number {
    return (refund.get('refund_line_items', []) as List<any>).reduce(
        (total = 0, refundLineItem: Map<any, any>) =>
            total +
            parseFloat(refundLineItem.get('total_cart_discount_amount')),
        0,
    )
}

export function getTotalTax(refund: Map<any, any>): number {
    return (refund.get('refund_line_items', []) as List<any>).reduce(
        (total = 0, refundLineItem: Map<any, any>) =>
            total + parseFloat(refundLineItem.get('total_tax')),
        parseFloat(refund.getIn(['shipping', 'tax'], 0)),
    )
}

export function getRefundAmount(refund: Map<any, any>): number {
    const max = getTotalAvailableToRefund(refund)
    const amount =
        (refund.get('transactions', Map()) as List<any>).reduce(
            (total = 0, transaction: Map<any, any>) =>
                total + parseFloat(transaction.get('amount')) * 100,
            0,
        ) / 100
    return amount > max ? max : amount
}

export function getTotalAvailableToRefund(refund: Map<any, any>): number {
    const buckets = aggregateMaximumRefundableByGateway(refund)

    return buckets
        .valueSeq()
        .reduce((total, next) => (total || 0) + (next || 0), 0)
}

export function distributeRefund(
    transactions: List<any>,
    amounts: Map<string, number>,
): List<any> {
    const head: Map<any, any> | undefined = transactions.first()
    if (!head) {
        return transactions
    }

    const gateway = head.get('gateway')
    const amount = amounts.get(gateway, 0)

    const max = parseFloat(head.get('maximum_refundable'))
    const toRefund = amount > max ? max : amount
    const rest = amounts.set(gateway, amount - toRefund)
    const transaction = head.set('amount', toRefund.toFixed(2))
    return distributeRefund(transactions.rest() as List<any>, rest).unshift(
        transaction,
    )
}

export function aggregateMaximumRefundableByGateway(
    refund: Map<any, any>,
): Map<string, number> {
    const transactions = refund.get('transactions', List()) as List<any>
    const amounts = transactions.reduce(
        (gateways: Map<string, number> = Map(), transaction: Map<any, any>) => {
            const maximum_refundable: string =
                transaction.get('maximum_refundable')
            const gateway: string = transaction.get('gateway')
            const amount = gateways.get(gateway) || 0
            return gateways.set(
                gateway,
                amount + parseFloat(maximum_refundable),
            )
        },
        Map(),
    )

    return amounts.delete('gift_card')
}

export function getTransactionToRefund(
    refund: Map<any, any>,
    amount: number,
): List<any> {
    const transactions = refund.get('transactions', List()) as List<any>
    const buckets = aggregateMaximumRefundableByGateway(refund)

    const gateways = buckets.keySeq()
    if (gateways.count() > 1) {
        throw new Error('Refund with multiple transaction is not supported')
    }

    const gateway = gateways.first()
    const amounts = Map({ [gateway]: amount })

    return distributeRefund(transactions, amounts)
}

export function getTotalQuantities(
    payload: Map<any, any>,
    suggestedRefund: Maybe<Map<any, any>>,
): number {
    return (payload.get('refund_line_items', []) as List<any>).reduce(
        (total = 0, refundLineItem: Map<any, any>) => {
            const quantity = refundLineItem.get('quantity') as number

            // No suggested refund: all the items are restockable
            if (!suggestedRefund || suggestedRefund.isEmpty()) {
                return total + quantity
            }

            // Restockable items have an associated `location_id` in the suggested refund
            const suggestedRefundLineItem = (
                suggestedRefund.get('refund_line_items', []) as List<any>
            ).find(
                (suggestedRefundLineItem: Map<any, any>) =>
                    suggestedRefundLineItem.get('line_item_id') ===
                    refundLineItem.get('line_item_id'),
            ) as Map<any, any>

            const locationId = suggestedRefundLineItem
                ? (suggestedRefundLineItem.get('location_id') as string)
                : null
            return locationId ? total + quantity : total
        },
        0,
    )
}

export function getRestockType(
    lineItem: Map<any, any>,
    restock = true,
): string {
    if (!restock || lineItem.get('fulfillment_status') === 'not_eligible') {
        return 'no_restock'
    }

    const isFulfilled = lineItem.get('fulfillment_status') === 'fulfilled'
    return isFulfilled ? 'return' : 'cancel'
}
