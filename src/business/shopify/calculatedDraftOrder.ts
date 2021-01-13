import {fromJS, Map} from 'immutable'

/**
 * On the GraphQL API, Shopify is using camel case for the keys. Also, on the `draftOrderCalculate` mutation, some
 * fields differ from the required fields on the draft order creation endpoint of the REST API.
 *
 * @param draftOrderPayload Payload used to create the draft order on the REST API.
 * @return Payload used to calculated the draft order on the GraphQL API.
 */
export function getCalculateDraftOrderPayload(
    draftOrderPayload: Map<any, any>
): Map<any, any> {
    const appliedDiscount: Map<any, any> = draftOrderPayload.get(
        'applied_discount'
    )
    const lineItems: Map<any, any> = draftOrderPayload.get('line_items')
    const shippingLine: Map<any, any> = draftOrderPayload.get('shipping_line')
    const shippingAddress: Map<any, any> = draftOrderPayload.get(
        'shipping_address'
    )

    return fromJS({
        appliedDiscount: !!appliedDiscount
            ? {
                  value: parseFloat(appliedDiscount.get('value')),
                  valueType: (appliedDiscount.get(
                      'value_type'
                  ) as string).toUpperCase(),
              }
            : null,
        customerId: draftOrderPayload.getIn([
            'customer',
            'admin_graphql_api_id',
        ]),
        lineItems: lineItems.map((lineItem: Map<any, any>) => {
            const lineItemAppliedDiscount: Map<any, any> = lineItem.get(
                'applied_discount'
            )

            return {
                appliedDiscount: !!lineItemAppliedDiscount
                    ? {
                          value: parseFloat(
                              lineItemAppliedDiscount.get('value')
                          ),
                          valueType: (lineItemAppliedDiscount.get(
                              'value_type'
                          ) as string).toUpperCase(),
                      }
                    : null,
                originalUnitPrice: lineItem.get('price'),
                quantity: lineItem.get('quantity'),
                requiresShipping: lineItem.get('requires_shipping'),
                sku: lineItem.get('sku'),
                taxable: lineItem.get('taxable'),
                title: lineItem.get('title'),
                variantId: lineItem.get('variant_admin_graphql_api_id'),
            }
        }),
        shippingAddress: !!shippingAddress
            ? {
                  address1: shippingAddress.get('address1'),
                  address2: shippingAddress.get('address2'),
                  city: shippingAddress.get('city'),
                  countryCode: shippingAddress.get('country_code'),
                  provinceCode: shippingAddress.get('province_code'),
                  zip: shippingAddress.get('zip'),
              }
            : null,
        shippingLine: !!shippingLine
            ? {
                  price: shippingLine.get('price'),
                  shippingRateHandle: shippingLine.get('handle'),
                  title: shippingLine.get('title'),
              }
            : null,
        taxExempt: draftOrderPayload.get('tax_exempt'),
    }) as Map<any, any>
}
