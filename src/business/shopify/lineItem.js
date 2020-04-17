// @flow

import _ceil from 'lodash/ceil'

import {fromJS, type Record} from 'immutable'

import * as Shopify from '../../constants/integrations/shopify'

import {formatPercentage, formatPrice} from './number'

export function initLineItemAppliedDiscount(
    lineItem: Record<Shopify.LineItem>,
    order: Record<Shopify.Order>
): ?Record<Shopify.AppliedDiscount> {
    if (!parseFloat(lineItem.get('total_discount'))) {
        return null
    }

    const indexes = lineItem.get('discount_allocations', []).map(
        (discountAllocation) => discountAllocation.get('discount_application_index')
    )

    let discountApplicationIndex = -1
    const discountApplication = order.get('discount_applications', []).find((discountApplication, index) => {
        const found = indexes.includes(index) &&
            discountApplication.get('allocation_method') === 'one' &&
            discountApplication.get('target_selection') === 'explicit' &&
            discountApplication.get('target_type') === 'line_item'

        if (found) {
            discountApplicationIndex = index
        }

        return found
    })

    if (!discountApplication) {
        return null
    }

    const discountAllocation = lineItem.get('discount_allocations', []).find((discountAllocation) =>
        discountAllocation.get('discount_application_index') === discountApplicationIndex
    )

    const quantity = lineItem.get('quantity')
    const currency = order.get('currency')

    const title = discountApplication.get('title')
    const description = discountApplication.get('description')
    const type = discountApplication.get('value_type')
    const value = discountApplication.get('value')

    const amount = discountAllocation.get('amount')

    const appliedValue = type === 'fixed_amount'
        ? formatPrice(parseFloat(value) / quantity, currency)
        : formatPercentage(value)
    const appliedAmount = formatPrice(amount, currency)

    return fromJS({
        title,
        description,
        value_type: type,
        value: appliedValue,
        amount: appliedAmount,
    })
}

export function getDraftOrderLineItemDiscountedPrice(lineItem: Record<Shopify.LineItem>, currencyCode: string): number {
    const price = parseFloat(lineItem.get('price'))
    const quantity = lineItem.get('quantity')
    const appliedDiscount = lineItem.get('applied_discount')
    const discountAmount = appliedDiscount ? parseFloat(appliedDiscount.get('amount')) : 0
    const isNonFractional = Shopify.NON_FRACTIONAL_CURRENCIES.includes(currencyCode)
    const decimals = isNonFractional ? 0 : 2

    return appliedDiscount ? _ceil(price - discountAmount / quantity, decimals) : price
}

export function getDraftOrderLineItemTotal(lineItem: Record<Shopify.LineItem>): number {
    const price = parseFloat(lineItem.get('price'))
    const quantity = lineItem.get('quantity')
    const appliedDiscount = lineItem.get('applied_discount')
    const discountAmount = appliedDiscount ? parseFloat(appliedDiscount.get('amount')) : 0

    return price * quantity - discountAmount
}

export function getDraftOrderTotalLineItemsPrice(draftOrder: Record<$Shape<Shopify.DraftOrder>>): number {
    return draftOrder.get('line_items', []).reduce((total, lineItem) => total + getDraftOrderLineItemTotal(lineItem), 0)
}

export function getPriceSetAmount(priceSet: Record<Shopify.PriceSet>, currencyCode: string): string {
    return priceSet.getIn(['presentment_money', 'currency_code']) === currencyCode
        ? priceSet.getIn(['presentment_money', 'amount'])
        : priceSet.getIn(['shop_money', 'amount'])
}

export function getOrderLineItemPrice(lineItem: Record<Shopify.LineItem>, currencyCode: string): string {
    return getPriceSetAmount(lineItem.get('price_set'), currencyCode)
}

export function getOrderLineItemTotalDiscount(lineItem: Record<Shopify.LineItem>, currencyCode: string): string {
    return getPriceSetAmount(lineItem.get('total_discount_set'), currencyCode)
}

export function getOrderLineItemDiscountedPrice(
    lineItem: Record<Shopify.LineItem>,
    currencyCode: string,
    quantity: number,
): number {
    if (quantity === 0) {
        return 0
    }

    const price = parseFloat(getOrderLineItemPrice(lineItem, currencyCode))
    const totalDiscount = parseFloat(getOrderLineItemTotalDiscount(lineItem, currencyCode))
    const discountAmount = totalDiscount / quantity
    const isNonFractional = Shopify.NON_FRACTIONAL_CURRENCIES.includes(currencyCode)
    const decimals = isNonFractional ? 0 : 2

    return _ceil(price - discountAmount, decimals)
}
