// @flow

import {fromJS, type List, type Record} from 'immutable'

import type {
    Customer,
    Order,
    Product,
    DraftOrder,
    Variant,
    LineItem,
    TaxLine,
} from '../../constants/integrations/types/shopify'

import {formatPercentage} from './number'
import {
    getDraftOrderTotalLineItemsPrice,
    initLineItemAppliedDiscount,
} from './lineItem'
import {getTotalDiscountAmount, refreshAppliedDiscounts} from './discount'

export function initDraftOrderPayload(
    customer: Record<$Shape<Customer>>,
    order: Record<Order> = fromJS({}),
    products: Map<number, Record<Product>> = new Map()
): Record<$Shape<DraftOrder>> {
    const draftOrder = fromJS({
        line_items: order.get('line_items', []).map((lineItem) => {
            const product = lineItem.get('product_exists')
                ? products.get(lineItem.get('product_id'))
                : null

            const variant = !!product
                ? product
                      .get('variants')
                      .find(
                          (variant) =>
                              variant.get('id') === lineItem.get('variant_id')
                      )
                : null

            return fromJS({
                product_id: !!product && !!variant ? product.get('id') : null,
                variant_id: !!variant ? variant.get('id') : null,
                quantity: lineItem.get('quantity') || 1,
                price: !!variant ? variant.get('price') : lineItem.get('price'),
                title: !!product ? product.get('title') : lineItem.get('title'),
                variant_title: !!variant
                    ? variant.get('title')
                    : lineItem.get('variant_title'),
                sku: !!variant ? variant.get('sku') : lineItem.get('sku'),
                taxable: !!variant
                    ? variant.get('taxable')
                    : lineItem.get('taxable'),
                requires_shipping: !!variant
                    ? variant.get('requires_shipping')
                    : lineItem.get('requires_shipping'),
                product_exists: !!variant,
                properties: lineItem.get('properties') || [],
                applied_discount: initLineItemAppliedDiscount(lineItem, order),
            })
        }),
        note: order.get('note') || '',
        tags: order.get('tags') || null,
        shipping_line: order.getIn(['shipping_lines', 0]) || null,
        tax_exempt: false,
        customer,
        billing_address:
            order.get('billing_address') || customer.get('default_address'),
        shipping_address:
            order.get('shipping_address') || customer.get('default_address'),
        currency: order.get('currency') || customer.get('currency'),
    })

    return refreshAppliedDiscounts(draftOrder)
}

export function addVariant(
    draftOrder: Record<$Shape<DraftOrder>>,
    product: Product,
    variant: Variant
): Record<$Shape<DraftOrder>> {
    const lineItemIndex = draftOrder
        .get('line_items', [])
        .findIndex(
            (lineItem) =>
                lineItem.get('product_id') === product.id &&
                lineItem.get('variant_id') === variant.id
        )

    return lineItemIndex === -1
        ? draftOrder.update('line_items', (lineItems) =>
              lineItems.push(
                  fromJS({
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
                  })
              )
          )
        : draftOrder.setIn(
              ['line_items', lineItemIndex, 'quantity'],
              draftOrder.getIn(['line_items', lineItemIndex, 'quantity']) + 1
          )
}

export function addCustomLineItem(
    draftOrder: Record<$Shape<DraftOrder>>,
    lineItem: Record<$Shape<LineItem>>
): Record<$Shape<DraftOrder>> {
    return draftOrder.update('line_items', (lineItems) =>
        lineItems.push(lineItem)
    )
}

export function getSubtotal(draftOrder: Record<$Shape<DraftOrder>>): number {
    return (
        getDraftOrderTotalLineItemsPrice(draftOrder) -
        getTotalDiscountAmount(draftOrder)
    )
}

export function getTotalShippingPrice(
    draftOrder: Record<$Shape<DraftOrder>>
): number {
    return parseFloat(draftOrder.getIn(['shipping_line', 'price'], 0))
}

export function getTaxLineLabel(
    taxLine: Record<TaxLine>,
    taxesIncluded: boolean
): string {
    const label = `${taxLine.get('title')} ${formatPercentage(
        taxLine.get('rate') * 100
    )}%`
    return taxesIncluded ? `${label} (included)` : label
}

export function getTotalTaxes(taxLines: List<TaxLine>): number {
    return taxLines.reduce(
        (total, taxLine) => total + parseFloat(taxLine.get('price')),
        0
    )
}

export function getTaxLinesTotals(
    draftOrder: Record<$Shape<DraftOrder>>
): Array<{label: string, total: number}> {
    const taxLines = draftOrder.get('tax_lines') || []
    const taxesIncluded = draftOrder.get('taxes_included')
    const taxLinesByLabel = new Map()

    taxLines.forEach((taxLine) => {
        const label = getTaxLineLabel(taxLine, taxesIncluded)
        const values = taxLinesByLabel.get(label) || []
        values.push(taxLine)
        taxLinesByLabel.set(label, values)
    })

    return Array.from(taxLinesByLabel.entries())
        .sort((a, b) => {
            const [, taxLinesA] = a
            const [, taxLinesB] = b
            const [taxLineA] = taxLinesA
            const [taxLineB] = taxLinesB

            return taxLineA.get('rate') === taxLineB.get('rate')
                ? taxLineA.get('title').localeCompare(taxLineB.get('title'))
                : taxLineB.get('rate') - taxLineA.get('rate')
        })
        .map(([label, values]) => ({
            label,
            total: getTotalTaxes(values),
        }))
}
