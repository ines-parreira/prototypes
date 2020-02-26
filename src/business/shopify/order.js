// @flow

import {fromJS, type List, type Record} from 'immutable'
import _floor from 'lodash/floor'
import _round from 'lodash/round'

import * as Shopify from '../../constants/integrations/shopify'

export function initDraftOrderPayload(order: Record<Shopify.Order>): Record<$Shape<Shopify.DraftOrder>> {
    return fromJS({
        line_items: order.get('line_items', []).map((lineItem) => fromJS({
            product_id: lineItem.get('product_id'),
            variant_id: lineItem.get('variant_id'),
            quantity: lineItem.get('quantity') || 1,
            price: lineItem.get('price'),
            title: lineItem.get('title') || '',
            variant_title: lineItem.get('variant_title') || '',
            sku: lineItem.get('sku') || '',
            taxable: lineItem.get('taxable') || false,
            requires_shipping: lineItem.get('requires_shipping') || false,
            product_exists: lineItem.get('product_exists') || false,
            properties: lineItem.get('properties') || [],
        })),
        note: order.get('note') || '',
        tags: order.get('tags') || null,
        shipping_line: order.getIn(['shipping_lines', 0]) || null,
        tax_exempt: false,
        customer: order.getIn(['customer', 'id'])
            ? {id: order.getIn(['customer', 'id'])}
            : null,
        billing_address: order.get('billing_address'),
        shipping_address: order.get('shipping_address'),
    })
}

export function addVariant(
    draftOrder: Record<$Shape<Shopify.DraftOrder>>,
    product: Shopify.Product,
    variant: Shopify.Variant
): Record<$Shape<Shopify.DraftOrder>> {
    const lineItemIndex = draftOrder.get('line_items', []).findIndex(
        (lineItem) => lineItem.get('product_id') === product.id
            && lineItem.get('variant_id') === variant.id
    )

    return lineItemIndex === -1
        ? draftOrder.update('line_items', (lineItems) =>
            lineItems.push(fromJS({
                product_id: product.id,
                variant_id: variant.id,
                quantity: 1,
                price: variant.price,
                title: product.title,
                variant_title: variant.title,
                sku: variant.sku,
                taxable: variant.taxable,
                requires_shipping: variant.requires_shipping,
                product_exists: true,
                properties: [],
            }))
        )
        : draftOrder.setIn(
            ['line_items', lineItemIndex, 'quantity'],
            draftOrder.getIn(['line_items', lineItemIndex, 'quantity']) + 1
        )
}

export function addCustomLineItem(
    draftOrder: Record<$Shape<Shopify.DraftOrder>>,
    lineItem: Record<$Shape<Shopify.LineItem>>
): Record<$Shape<Shopify.DraftOrder>> {
    return draftOrder.update('line_items', (lineItems) => lineItems.push(lineItem))
}

export function getLineItemDiscountedPrice(lineItem: Record<Shopify.LineItem>): number {
    const appliedDiscount = lineItem.get('applied_discount')
    const result = appliedDiscount
        ? applyDiscount(lineItem.get('price'), appliedDiscount.get('value_type'), appliedDiscount.get('value'))
        : parseFloat(lineItem.get('price'))

    return _floor(result, 2)
}

export function getLineItemTotal(lineItem: Record<Shopify.LineItem>): number {
    return _round(getLineItemDiscountedPrice(lineItem) * lineItem.get('quantity'), 2)
}

export function getTotalLineItemsPrice(draftOrder: Record<$Shape<Shopify.DraftOrder>>): number {
    const total = draftOrder.get('line_items', []).reduce((total, lineItem) => total + getLineItemTotal(lineItem), 0)
    return _round(total, 2)
}

export function getDiscountAmount(amount: number, discountType: Shopify.DiscountType, discountAmount: string): number {
    const result = discountType === 'fixed_amount'
        ? parseFloat(discountAmount)
        : parseFloat(discountAmount) * amount / 100

    return _floor(result, 2)
}

/**
 * As described here, we have to use `floor` to apply discounts:
 * https://shopify.dev/docs/admin-api/rest/reference/orders/draftorder#applying-discounts-2020-01
 */
export function applyDiscount(amount: string, discountType: Shopify.DiscountType, discountAmount: string): number {
    const parsedAmount = parseFloat(amount)
    const totalDiscountAmount = getDiscountAmount(parsedAmount, discountType, discountAmount)

    return _floor(parsedAmount - totalDiscountAmount, 2)
}

export function getTotalDiscountAmount(draftOrder: Record<$Shape<Shopify.DraftOrder>>): number {
    const appliedDiscount = draftOrder.get('applied_discount')
    const result = !!appliedDiscount ? parseFloat(appliedDiscount.get('amount')) : 0

    return _floor(result, 2)
}

export function refreshAppliedDiscounts(
    draftOrder: Record<$Shape<Shopify.DraftOrder>>
): Record<$Shape<Shopify.DraftOrder>> {
    const appliedDiscount = draftOrder.get('applied_discount')

    if (appliedDiscount && appliedDiscount.get('value_type') === 'percentage') {
        const totalLineItemsPrice = getTotalLineItemsPrice(draftOrder)
        const type = appliedDiscount.get('value_type')
        const value = appliedDiscount.get('value')
        const amount = formatPrice(getDiscountAmount(totalLineItemsPrice, type, value))
        return draftOrder.setIn(['applied_discount', 'amount'], amount)
    }

    return draftOrder
}

export function getSubtotal(draftOrder: Record<$Shape<Shopify.DraftOrder>>): number {
    return _round(getTotalLineItemsPrice(draftOrder) - getTotalDiscountAmount(draftOrder), 2)
}

export function getTotalShippingPrice(draftOrder: Record<$Shape<Shopify.DraftOrder>>): number {
    return _round(parseFloat(draftOrder.getIn(['shipping_line', 'price'], 0)), 2)
}

export function getTaxLineLabel(taxLine: Record<Shopify.TaxLine>): string {
    return `${taxLine.get('title')} ${formatPrice(taxLine.get('rate') * 100)}%`
}

export function getTotalTaxes(taxLines: List<Shopify.TaxLine>): number {
    return taxLines.reduce((total, taxLine) => total + parseFloat(taxLine.get('price')), 0)
}

export function getTaxLinesTotals(
    draftOrder: Record<$Shape<Shopify.DraftOrder>>
): Array<{ label: string, total: number }> {
    const taxLines = draftOrder.get('tax_lines') || []
    const taxLinesByLabel = new Map()

    taxLines.forEach((taxLine) => {
        const label = getTaxLineLabel(taxLine)
        const values = taxLinesByLabel.get(label) || []
        values.push(taxLine)
        taxLinesByLabel.set(label, values)
    })

    return Array.from(taxLinesByLabel.entries())
        .sort(([, [a]], [, [b]]) =>
            a.get('rate') === b.get('rate')
                ? a.get('title').localeCompare(b.get('title'))
                : b.get('rate') - a.get('rate')
        )
        .map(([label, values]) => ({
            label,
            total: getTotalTaxes(values),
        }))
}

export function getTotal(draftOrder: Record<$Shape<Shopify.DraftOrder>>): number {
    const taxLines = draftOrder.get('tax_lines', [])
    return getSubtotal(draftOrder) + getTotalShippingPrice(draftOrder) + getTotalTaxes(taxLines)
}

export function formatPrice(price: number | string): string {
    return Number(price).toFixed(2)
}
