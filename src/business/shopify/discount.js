// @flow

import type {Record} from 'immutable'

import type {
    DiscountType,
    DraftOrder,
} from '../../constants/integrations/types/shopify'

import {formatPrice} from './number'
import {getDraftOrderTotalLineItemsPrice} from './lineItem'

export function getDiscountAmount(
    price: number,
    discountType: DiscountType,
    discountValue: string,
    quantity: number = 1
): number {
    const value = parseFloat(discountValue)

    return discountType === 'fixed_amount'
        ? quantity * value
        : (quantity * value * price) / 100
}

export function getTotalDiscountAmount(
    draftOrder: Record<$Shape<DraftOrder>>
): number {
    const appliedDiscount = draftOrder.get('applied_discount')
    return !!appliedDiscount ? parseFloat(appliedDiscount.get('amount')) : 0
}

/**
 * When we change the quantity of a line item, we have to refresh the amounts of applied discounts (on the line items,
 * or on the global applied discount), because discount amounts depend on quantities.
 */
export function refreshAppliedDiscounts(
    draftOrder: Record<$Shape<DraftOrder>>
): Record<$Shape<DraftOrder>> {
    let newDraftOrder = draftOrder

    draftOrder.get('line_items', []).forEach((lineItem, index) => {
        const appliedDiscount = lineItem.get('applied_discount')
        if (!appliedDiscount) {
            return
        }

        const price = parseFloat(lineItem.get('price'))
        const quantity = lineItem.get('quantity')
        const type = appliedDiscount.get('value_type')
        const value = appliedDiscount.get('value')
        const currency = draftOrder.get('currency')
        const amount = getDiscountAmount(price, type, value, quantity)

        newDraftOrder = newDraftOrder.setIn(
            ['line_items', index, 'applied_discount', 'amount'],
            formatPrice(amount, currency, true)
        )
    })

    const appliedDiscount = newDraftOrder.get('applied_discount')

    if (appliedDiscount && appliedDiscount.get('value_type') === 'percentage') {
        const totalLineItemsPrice = getDraftOrderTotalLineItemsPrice(
            newDraftOrder
        )
        const type = appliedDiscount.get('value_type')
        const value = appliedDiscount.get('value')
        const currency = draftOrder.get('currency')
        const amount = getDiscountAmount(totalLineItemsPrice, type, value)
        newDraftOrder = newDraftOrder.setIn(
            ['applied_discount', 'amount'],
            formatPrice(amount, currency, true)
        )
    }

    return newDraftOrder
}
