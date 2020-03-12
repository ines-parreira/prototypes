// @flow

import {type Record} from 'immutable'

import * as Shopify from '../../constants/integrations/shopify'

export function getSubtotal(refund: Record<Shopify.Refund>): number {
    return refund.get('refund_line_items', []).reduce(
        (total, refundLineItem) =>
            total + parseFloat(refundLineItem.get('discounted_price')) * refundLineItem.get('quantity'),
        0
    )
}

export function getTotalCartDiscountAmount(refund: Record<Shopify.Refund>): number {
    return refund.get('refund_line_items', []).reduce(
        (total, refundLineItem) => total + parseFloat(refundLineItem.get('total_cart_discount_amount')),
        0
    )
}

export function getTotalTax(refund: Record<Shopify.Refund>): number {
    return refund.get('refund_line_items', []).reduce(
        (total, refundLineItem) => total + parseFloat(refundLineItem.get('total_tax')),
        0
    )
}

export function getRefundAmount(refund: Record<Shopify.Refund>): number {
    return parseFloat(refund.getIn(['transactions', 0, 'amount'], 0))
}

export function getTotalAvailableToRefund(refund: Record<Shopify.Refund>): number {
    return parseFloat(refund.getIn(['transactions', 0, 'maximum_refundable'], 0))
}

export function getTotalQuantities(refund: Record<Shopify.Refund>): number {
    return refund.get('refund_line_items', []).reduce((total, lineItem) => total + lineItem.get('quantity'), 0)
}
