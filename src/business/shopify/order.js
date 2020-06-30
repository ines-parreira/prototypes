// @flow

import {fromJS, type List, type Record} from 'immutable'

import * as Shopify from '../../constants/integrations/shopify'

import {getRefundAmount, getRestockType} from './refund'
import {formatPrice} from './number'

export function initCancelOrderPayload(
    order: Record<Shopify.Order>
): Record<$Shape<Shopify.CancelOrderPayload>> {
    return fromJS({
        reason: 'customer',
        email: true,
        refund: initRefundOrderPayload(order, false),
    })
}

export function initRefundOrderPayload(
    order: Record<Shopify.Order>,
    notify: boolean = true
): Record<$Shape<Shopify.RefundOrderPayload>> {
    const currency = order.getIn([
        'total_price_set',
        'presentment_money',
        'currency_code',
    ])

    return fromJS({
        currency,
        restock: true,
        notify,
        refund_line_items: order.get('line_items', []).map((lineItem) =>
            fromJS({
                line_item_id: lineItem.get('id'),
                fulfillment_status: lineItem.get('fulfillment_status'),
                restock_type: getRestockType(lineItem),
                quantity: getLineItemQuantity(order, lineItem),
            })
        ),
        shipping: {
            amount: '0.00',
        },
        transactions: [{amount: ''}],
    })
}

export function initRefundOrderLineItems(
    order: Record<Shopify.Order>
): List<$Shape<Shopify.LineItem>> {
    return order.get('line_items', []).map((lineItem) =>
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
        })
    )
}

export function getLineItemQuantity(
    order: Record<Shopify.Order>,
    lineItem: Record<Shopify.LineItem>
): number {
    let quantity = lineItem.get('quantity')

    order.get('refunds', []).forEach((refund) => {
        refund
            .get('refund_line_items', [])
            .filter(
                (refundLineItem) =>
                    refundLineItem.get('line_item_id') === lineItem.get('id')
            )
            .forEach((refundLineItem) => {
                quantity -= refundLineItem.get('quantity')
            })
    })

    return quantity
}

export function getFinalCancelOrderPayload(
    payload: Record<$Shape<Shopify.CancelOrderPayload>>,
    refund: Record<Shopify.Refund>
): Record<$Shape<Shopify.CancelOrderPayload>> {
    const refundPayload = payload.get('refund')

    return payload.set(
        'refund',
        getFinalRefundOrderPayload(refundPayload, refund)
    )
}

export function getFinalRefundOrderPayload(
    payload: Record<$Shape<Shopify.RefundOrderPayload>>,
    refund: Record<Shopify.Refund>
): Record<$Shape<Shopify.CancelOrderPayload>> {
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
        .update('refund_line_items', (refundLineItems) =>
            refundLineItems
                .filter((refundLineItem) => !!refundLineItem.get('quantity'))
                .map((refundLineItem) => {
                    let newLineItem = refundLineItem.set(
                        'restock_type',
                        getRestockType(refundLineItem, restock)
                    )

                    const suggestedRefundLineItem = refund
                        .get('refund_line_items', [])
                        .find(
                            (suggestedLineItem) =>
                                suggestedLineItem.get('line_item_id') ===
                                refundLineItem.get('line_item_id')
                        )

                    if (suggestedRefundLineItem) {
                        const locationId = suggestedRefundLineItem.get(
                            'location_id'
                        )
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
            refund
                .get('transactions', [])
                .map((transaction) => transaction.set('kind', 'refund'))
        )
        .setIn(['transactions', 0, 'amount'], amount)

    return finalPayload
}
