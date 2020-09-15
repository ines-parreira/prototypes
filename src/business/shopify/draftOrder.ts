import {fromJS, List, Map} from 'immutable'

import {Product, Variant} from '../../constants/integrations/types/shopify'

import {formatPercentage} from './number'
import {
    getDraftOrderTotalLineItemsPrice,
    initLineItemAppliedDiscount,
} from './lineItem'
import {getTotalDiscountAmount, refreshAppliedDiscounts} from './discount'

export function initDraftOrderPayload(
    customer: Map<any, any>,
    order: Map<any, any> = fromJS({}),
    products = new window.Map()
): Map<any, any> {
    const draftOrder = fromJS({
        line_items: (order.get('line_items', []) as List<any>).map(
            (lineItem: Map<any, any>) => {
                const product: Maybe<Map<any, any>> = lineItem.get(
                    'product_exists'
                )
                    ? products.get(lineItem.get('product_id'))
                    : null

                const variant = !!product
                    ? ((product.get('variants') as List<any>).find(
                          (variant: Map<any, any>) =>
                              variant.get('id') === lineItem.get('variant_id')
                      ) as Maybe<Map<any, any>>)
                    : null

                return fromJS({
                    product_id:
                        !!product && !!variant ? product.get('id') : null,
                    variant_id: !!variant ? variant.get('id') : null,
                    quantity: lineItem.get('quantity') || 1,
                    price: !!variant
                        ? variant.get('price')
                        : lineItem.get('price'),
                    title: !!product
                        ? product.get('title')
                        : lineItem.get('title'),
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
                    applied_discount: initLineItemAppliedDiscount(
                        lineItem,
                        order
                    ),
                }) as Map<any, any>
            }
        ),
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
    draftOrder: Map<any, any>,
    product: Product,
    variant: Variant
): Map<any, any> {
    const lineItemIndex = (draftOrder.get('line_items', []) as List<
        any
    >).findIndex(
        (lineItem: Map<any, any>) =>
            lineItem.get('product_id') === product.id &&
            lineItem.get('variant_id') === variant.id
    )

    return lineItemIndex === -1
        ? draftOrder.update('line_items', (lineItems: List<any>) =>
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
              (draftOrder.getIn([
                  'line_items',
                  lineItemIndex,
                  'quantity',
              ]) as number) + 1
          )
}

export function addCustomLineItem(
    draftOrder: Map<any, any>,
    lineItem: Map<any, any>
): Map<any, any> {
    return draftOrder.update('line_items', (lineItems: List<any>) =>
        lineItems.push(lineItem)
    )
}

export function getSubtotal(draftOrder: Map<any, any>): number {
    return (
        getDraftOrderTotalLineItemsPrice(draftOrder) -
        getTotalDiscountAmount(draftOrder)
    )
}

export function getTotalShippingPrice(draftOrder: Map<any, any>): number {
    return parseFloat(draftOrder.getIn(['shipping_line', 'price'], 0))
}

export function getTaxLineLabel(
    taxLine: Map<any, any>,
    taxesIncluded: boolean
): string {
    const label = `${taxLine.get('title') as string} ${formatPercentage(
        taxLine.get('rate') * 100
    )}%`
    return taxesIncluded ? `${label} (included)` : label
}

export function getTotalTaxes(taxLines: List<any>): number {
    return taxLines.reduce(
        (total = 0, taxLine: Map<any, any>) =>
            total + parseFloat(taxLine.get('price')),
        0
    )
}

export function getTaxLinesTotals(draftOrder: Map<any, any>) {
    const taxLines = (draftOrder.get('tax_lines') || []) as List<any>
    const taxesIncluded = draftOrder.get('taxes_included')
    const taxLinesByLabel = new window.Map()

    taxLines.forEach((taxLine: Map<any, any>) => {
        const label = getTaxLineLabel(taxLine, taxesIncluded)
        const values = (taxLinesByLabel.get(label) || []) as List<any>
        values.push(taxLine)
        taxLinesByLabel.set(label, values)
    })

    return Array.from(taxLinesByLabel.entries())
        .sort((a: [string, Map<any, any>[]], b: [string, Map<any, any>[]]) => {
            const [, taxLinesA] = a
            const [, taxLinesB] = b
            const [taxLineA] = taxLinesA
            const [taxLineB] = taxLinesB

            return taxLineA.get('rate') === taxLineB.get('rate')
                ? (taxLineA.get('title') as string).localeCompare(
                      taxLineB.get('title')
                  )
                : taxLineB.get('rate') - taxLineA.get('rate')
        })
        .map(([label, values]: [string, List<any>]) => ({
            label,
            total: getTotalTaxes(values),
        })) as Array<{label: string; total: number}>
}
