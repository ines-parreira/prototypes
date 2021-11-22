import _ceil from 'lodash/ceil'

import {fromJS, Map, List} from 'immutable'

import {
    DiscountType,
    NonFractionalCurrency,
} from '../../constants/integrations/types/shopify'

import {formatPercentage, formatPrice} from './number'

export function initLineItemAppliedDiscount(
    lineItem: Map<any, any>,
    order: Map<any, any>
): Maybe<Map<any, any>> {
    if (!parseFloat(lineItem.get('total_discount'))) {
        return null
    }

    const indexes = (lineItem.get('discount_allocations', []) as List<any>).map(
        (discountAllocation: Map<any, any>) =>
            discountAllocation.get('discount_application_index') as number
    )

    let discountApplicationIndex: Maybe<number> = -1
    const discountApplication = (
        order.get('discount_applications', []) as List<any>
    ).find((discountApplication: Map<any, any>, index) => {
        const found =
            indexes.includes(index as number) &&
            discountApplication.get('target_selection') === 'explicit' &&
            discountApplication.get('target_type') === 'line_item'

        if (found) {
            discountApplicationIndex = index
        }

        return found
    }) as Map<any, any>

    if (!discountApplication) {
        return null
    }

    const discountAllocation = (
        lineItem.get('discount_allocations', []) as List<any>
    ).find(
        (discountAllocation: Map<any, any>) =>
            discountAllocation.get('discount_application_index') ===
            discountApplicationIndex
    ) as Map<any, any>

    const currency = order.get('currency')

    const title = discountApplication.get('title')
    const description = discountApplication.get('description')
    const type = discountApplication.get('value_type')
    const value = discountApplication.get('value')

    const amount = discountAllocation.get('amount')

    const appliedValue =
        type === DiscountType.FixedAmount
            ? formatPrice(value, currency)
            : formatPercentage(value)
    const appliedAmount = formatPrice(amount, currency)
    return fromJS({
        title,
        description,
        value_type: type,
        value: appliedValue,
        amount: appliedAmount,
    }) as Map<any, any>
}

export function getDraftOrderLineItemDiscountedPrice(
    lineItem: Map<any, any>,
    currencyCode: string
): number {
    const price = parseFloat(lineItem.get('price'))
    const quantity = lineItem.get('quantity')
    const appliedDiscount = lineItem.get('applied_discount') as Map<any, any>
    const discountAmount = appliedDiscount
        ? parseFloat(appliedDiscount.get('amount'))
        : 0
    const isNonFractional = Object.values(NonFractionalCurrency).includes(
        currencyCode as NonFractionalCurrency
    )
    const decimals = isNonFractional ? 0 : 2

    return appliedDiscount
        ? _ceil(price - discountAmount / quantity, decimals)
        : price
}

export function getDraftOrderLineItemTotal(lineItem: Map<any, any>): number {
    const price = parseFloat(lineItem.get('price'))
    const quantity = lineItem.get('quantity')
    const appliedDiscount = lineItem.get('applied_discount') as Map<any, any>
    const discountAmount = appliedDiscount
        ? parseFloat(appliedDiscount.get('amount'))
        : 0

    return price * quantity - discountAmount
}

export function getDraftOrderTotalLineItemsPrice(
    draftOrder: Map<any, any>
): number {
    return (draftOrder.get('line_items', []) as List<any>).reduce(
        (total = 0, lineItem: Map<any, any>) =>
            total + getDraftOrderLineItemTotal(lineItem),
        0
    )
}

export function getPriceSetAmount(
    priceSet: Map<any, any>,
    currencyCode: string
): string {
    return priceSet.getIn(['presentment_money', 'currency_code']) ===
        currencyCode
        ? (priceSet.getIn(['presentment_money', 'amount']) as string)
        : (priceSet.getIn(['shop_money', 'amount']) as string)
}

export function getOrderLineItemPrice(
    lineItem: Map<any, any>,
    currencyCode: string
): string {
    return getPriceSetAmount(lineItem.get('price_set'), currencyCode)
}

export function getOrderLineItemTotalDiscount(
    lineItem: Map<any, any>,
    currencyCode: string
): string {
    return getPriceSetAmount(lineItem.get('total_discount_set'), currencyCode)
}

export function getOrderLineItemDiscountedPrice(
    lineItem: Map<any, any>,
    currencyCode: string,
    quantity: number
): number {
    if (quantity === 0) {
        return 0
    }

    const price = parseFloat(getOrderLineItemPrice(lineItem, currencyCode))
    const totalDiscount = parseFloat(
        getOrderLineItemTotalDiscount(lineItem, currencyCode)
    )
    const discountAmount = totalDiscount / quantity
    const isNonFractional = Object.values(NonFractionalCurrency).includes(
        currencyCode as NonFractionalCurrency
    )
    const decimals = isNonFractional ? 0 : 2

    return _ceil(price - discountAmount, decimals)
}
