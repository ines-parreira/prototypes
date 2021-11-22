import {fromJS, List, Map} from 'immutable'

import {getRefundAmount, getRestockType} from './refund'
import {formatPrice} from './number'

export function initCancelOrderPayload(order: Map<any, any>): Map<any, any> {
    return fromJS({
        reason: 'customer',
        email: true,
        refund: initRefundOrderPayload(order, false),
    }) as Map<any, any>
}

export function initRefundOrderPayload(
    order: Map<any, any>,
    notify = true
): Map<any, any> {
    const currency = order.getIn([
        'total_price_set',
        'presentment_money',
        'currency_code',
    ])

    return fromJS({
        currency,
        restock: true,
        notify,
        refund_line_items: (order.get('line_items', []) as List<any>).map(
            (lineItem: Map<any, any>) =>
                fromJS({
                    line_item_id: lineItem.get('id'),
                    fulfillment_status: lineItem.get('fulfillment_status'),
                    restock_type: getRestockType(lineItem),
                    quantity: getLineItemQuantity(order, lineItem),
                }) as Map<any, any>
        ),
        shipping: {
            amount: '0.00',
        },
        transactions: [{amount: ''}],
    }) as Map<any, any>
}

export function initRefundOrderLineItems(order: Map<any, any>): List<any> {
    return (order.get('line_items', []) as List<any>).map(
        (lineItem: Map<any, any>) =>
            fromJS({
                quantity: getLineItemQuantity(order, lineItem),
                id: lineItem.get('id'),
                product_id: lineItem.get('product_id'),
                variant_id: lineItem.get('variant_id'),
                price_set: lineItem.get('price_set'),
                title: lineItem.get('title'),
                variant_title: lineItem.get('variant_title'),
                sku: lineItem.get('sku'),
                total_discount_set: lineItem.get('total_discount_set'),
            }) as Map<any, any>
    ) as List<any>
}

export function getLineItemQuantity(
    order: Map<any, any>,
    lineItem: Map<any, any>
): number {
    let quantity = lineItem.get('quantity') as number

    ;(order.get('refunds', []) as List<any>).forEach(
        (refund: Map<any, any>) => {
            ;(refund.get('refund_line_items', []) as List<any>)
                .filter(
                    (refundLineItem: Map<any, any>) =>
                        refundLineItem.get('line_item_id') ===
                        lineItem.get('id')
                )
                .forEach((refundLineItem: Map<any, any>) => {
                    quantity -= refundLineItem.get('quantity')
                })
        }
    )

    return quantity
}

export function getFinalCancelOrderPayload(
    payload: Map<any, any>,
    refund: Map<any, any>
): Map<any, any> {
    const refundPayload = payload.get('refund')

    return payload.set(
        'refund',
        getFinalRefundOrderPayload(refundPayload, refund)
    )
}

export function getFinalRefundOrderPayload(
    payload: Map<any, any>,
    refund: Map<any, any>
): Map<any, any> {
    let finalPayload = payload

    // Format amount
    const currency = finalPayload.get('currency')
    const amount = formatPrice(
        finalPayload.getIn(['transactions', 0, 'amount']),
        currency
    )

    // Remove discrepancy reason if there is no discrepancy
    const discrepancyLimit = getRefundAmount(refund)
    const hasDiscrepancy = parseFloat(amount) !== discrepancyLimit

    if (!hasDiscrepancy) {
        finalPayload = finalPayload.delete('discrepancy_reason')
    }

    // Update line items
    const restock = finalPayload.get('restock')

    finalPayload = finalPayload
        .delete('restock')
        .update('refund_line_items', (refundLineItems: List<any>) =>
            refundLineItems
                .filter(
                    (refundLineItem: Map<any, any>) =>
                        !!refundLineItem.get('quantity')
                )
                .map((refundLineItem: Map<any, any>) => {
                    let newLineItem = refundLineItem.set(
                        'restock_type',
                        getRestockType(refundLineItem, restock)
                    )

                    const suggestedRefundLineItem = (
                        refund.get('refund_line_items', []) as List<any>
                    ).find(
                        (suggestedLineItem: Map<any, any>) =>
                            suggestedLineItem.get('line_item_id') ===
                            refundLineItem.get('line_item_id')
                    ) as Maybe<Map<any, any>>

                    if (suggestedRefundLineItem) {
                        const locationId =
                            suggestedRefundLineItem.get('location_id')
                        newLineItem = newLineItem.set('location_id', locationId)

                        if (!locationId) {
                            newLineItem = newLineItem.set(
                                'restock_type',
                                'no_restock'
                            )
                        }
                    }

                    return newLineItem.remove('fulfillment_status')
                })
        )

    // Update transactions
    finalPayload = finalPayload
        .set(
            'transactions',
            (refund.get('transactions', []) as List<any>).map(
                (transaction: Map<any, any>) =>
                    transaction.set('kind', 'refund')
            )
        )
        .setIn(['transactions', 0, 'amount'], amount)

    return finalPayload
}
