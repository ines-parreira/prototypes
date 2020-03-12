// @flow

import {fromJS, type List, type Record} from 'immutable'

import * as Shopify from '../../constants/integrations/shopify'

import {getRefundAmount} from './refund'
import {formatPrice} from './number'

export function initCancelOrderPayload(order: Record<Shopify.Order>): Record<$Shape<Shopify.CancelOrderPayload>> {
    const currency = order.getIn(['total_price_set', 'presentment_money', 'currency_code'])
    const shippingAmount = formatPrice(getRefundableShippingAmount(order), currency)

    return fromJS({
        reason: 'customer',
        email: true,
        refund: {
            currency,
            restock: true,
            notify: false,
            refund_line_items: order.get('line_items', []).map((lineItem) => fromJS({
                line_item_id: lineItem.get('id'),
                restock_type: 'cancel',
                quantity: getLineItemQuantity(order, lineItem),
            })),
            shipping: {
                amount: shippingAmount,
            },
        },
    })
}

export function initCancelOrderLineItems(order: Record<Shopify.Order>): List<$Shape<Shopify.LineItem>> {
    return order.get('line_items', []).map((lineItem) => fromJS({
        quantity: getLineItemQuantity(order, lineItem),
        id: lineItem.get('id'),
        product_id: lineItem.get('product_id'),
        variant_id: lineItem.get('variant_id'),
        price: lineItem.get('price'),
        title: lineItem.get('title'),
        variant_title: lineItem.get('variant_title'),
        sku: lineItem.get('sku'),
        total_discount: lineItem.get('total_discount'),
    }))
}

export function getLineItemQuantity(order: Record<Shopify.Order>, lineItem: Record<Shopify.LineItem>): number {
    let quantity = lineItem.get('quantity')

    order.get('refunds', []).forEach((refund) => {
        refund.get('refund_line_items', [])
            .filter((refundLineItem) => refundLineItem.get('line_item_id') === lineItem.get('id'))
            .forEach((refundLineItem) => {
                quantity -= refundLineItem.get('quantity')
            })
    })

    return quantity
}

export function getRefundableShippingAmount(order: Record<Shopify.Order>): number {
    let amount = parseFloat(order.getIn(['shipping_lines', 0, 'price_set', 'presentment_money', 'amount'], 0))

    order.get('refunds', []).forEach((refund) => {
        refund.get('order_adjustments', [])
            .filter((orderAdjustment) => orderAdjustment.get('kind') === 'shipping_refund')
            .forEach((orderAdjustment) => {
                amount += parseFloat(orderAdjustment.get('amount'))
            })
    })

    return amount
}

export function getFinalCancelOrderPayload(
    payload: Record<$Shape<Shopify.CancelOrderPayload>>,
    refund: Record<Shopify.Refund>,
): Record<$Shape<Shopify.CancelOrderPayload>> {
    // Format amount
    const currency = payload.getIn(['refund', 'currency'])
    const amount = formatPrice(payload.get('amount'), currency)
    let finalPayload = payload.delete('amount')

    // Remove discrepancy reason if there is no discrepancy
    const discrepancyLimit = getRefundAmount(refund)
    const hasDiscrepancy = parseFloat(amount) !== parseFloat(discrepancyLimit)

    if (!hasDiscrepancy) {
        finalPayload = finalPayload.deleteIn(['refund', 'discrepancy_reason'])
    }

    // Update line items
    finalPayload = finalPayload
        .deleteIn(['refund', 'restock'])
        .updateIn(['refund', 'refund_line_items'], (refundLineItems) =>
            refundLineItems
                .filter((refundLineItem) => !!refundLineItem.get('quantity'))
                .map((refundLineItem) => {
                    const suggestedRefundLineItem = refund.get('refund_line_items', []).find((suggestedLineItem) =>
                        suggestedLineItem.get('line_item_id') === refundLineItem.get('line_item_id')
                    )

                    let newLineItem = refundLineItem

                    if (suggestedRefundLineItem) {
                        newLineItem = newLineItem.set('location_id', suggestedRefundLineItem.get('location_id'))
                    }

                    return newLineItem
                })
        )

    // Update transactions
    finalPayload = finalPayload
        .setIn(['refund', 'transactions'], refund.get('transactions', []).map((transaction) =>
            transaction.set('kind', 'refund')
        ))
        .setIn(['refund', 'transactions', 0, 'amount'], amount)

    return finalPayload
}
