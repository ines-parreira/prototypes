import client from 'models/api/resources'

import {
    BigCommerceCart,
    BigCommerceCartLineItem,
    BigCommerceCustomerAddress,
    BigCommerceCheckout,
    BigCommerceCreateConsignmentPayload,
    BigCommerceUpsertConsignmentPayload,
    BigCommerceNestedCheckout,
    BigCommerceCustomProduct,
    BigCommerceNestedCart,
    BigCommerceProduct,
    BigCommerceErrorMessage,
} from '../types'
export type OptionSelection = {option_id: number; option_value: number}

export async function createBigCommerceCart(
    integrationId: number,
    customerId: number,
    currency: string
): Promise<BigCommerceCart> {
    const url = '/integrations/bigcommerce/order/cart/'

    const payload = {
        customer_id: customerId,
        line_items: [],
        currency: {
            code: currency,
        },
    }

    const response = await client.post<BigCommerceCart>(url, payload, {
        params: {
            integration_id: integrationId,
        },
    })

    return response.data
}
export async function deleteBigCommerceCart(
    integrationId: number,
    cartId: Maybe<string>
) {
    const url = '/integrations/bigcommerce/order/cart/'

    if (!!cartId) {
        return await client.delete(url, {
            params: {
                integration_id: integrationId,
                cart_id: cartId,
            },
        })
    }
}

export async function addBigCommerceCheckoutBillingAddress(
    integrationId: number,
    cartId: string,
    payload: BigCommerceCustomerAddress
): Promise<BigCommerceCheckout> {
    const url = '/integrations/bigcommerce/order/billing-address/'

    const response = await client.post<BigCommerceCheckout>(url, payload, {
        params: {
            integration_id: integrationId,
            cart_id: cartId,
        },
    })

    return response.data
}

type AddLineItemResponse =
    | {
          cart: BigCommerceCart
      }
    | {
          cart: Record<string, unknown>
          error: string
          updated_product?: BigCommerceProduct
      }

export async function addBigCommerceLineItem({
    integrationId,
    cartId,
    productId,
    variantId,
    optionSelections,
    customProduct,
}: {
    integrationId: number
    cartId: string
    productId?: number
    variantId?: number
    optionSelections?: OptionSelection[]
    customProduct?: BigCommerceCustomProduct
}): Promise<BigCommerceCart> {
    // Add a line item or a custom line item to the Cart.

    const url = '/integrations/bigcommerce/order/line-item/'

    const payload = customProduct
        ? {
              custom_items: [customProduct],
          } // Custom Line Item
        : {
              line_items: [
                  {
                      product_id: productId,
                      variant_id: variantId,
                      quantity: 1,
                      option_selections: optionSelections,
                  },
              ],
          } // Line Item

    const response = await client.post<AddLineItemResponse>(url, payload, {
        params: {
            integration_id: integrationId,
            cart_id: cartId,
        },
    })

    // TODO:https://linear.app/gorgias/issue/APPED-1319/fe-handle-modifier-changes-while-adding-line-item
    if ('error' in response.data) {
        throw Error(response.data.error)
    }

    return response.data.cart
}

export type EditLineItemResponse = {
    data:
        | {
              cart: BigCommerceCart
          }
        | {
              cart: Record<string, unknown>
              error: string
              updated_product?: BigCommerceProduct
          }
}

export class EditBigCommerceLineItemError extends Error {
    public message: string

    constructor(message: string) {
        super()
        this.message = message
    }
}

/**
 * Below RegExp works on a line like this
 * "[BIGCOMMERCE][update_line_item_from_cart] BigCommerce API has returned an error: (422): You can only purchase a maximum of 10 of the whatsupp33 per order."
 *
 * Captured "message" will be " You can only purchase a maximum of 10 of the whatsupp33 per order."
 *
 * Need to change TS target to use RegExp named capturing groups :(
 */
const editBigCommerceLineItemRegExp =
    /BigCommerce API has returned an error: \((?<code>[0-9]{3})\):(?<message>.*)/i

export async function editBigCommerceLineItem({
    integrationId,
    cartId,
    lineItem,
    quantity,
    listPrice,
}: {
    integrationId: number
    cartId: string
    lineItem: BigCommerceCartLineItem
    quantity: number
    listPrice?: number
}): Promise<BigCommerceCart> {
    // Updates an existing, single line item in the Cart. Custom items cannot be updated via API.

    const url = '/integrations/bigcommerce/order/line-item/'

    const payload = {
        line_item: {
            product_id: lineItem.product_id,
            variant_id: lineItem.variant_id,
            quantity,
            list_price: listPrice,
        },
    }

    const {data} = await client.put<EditLineItemResponse>(url, payload, {
        params: {
            integration_id: integrationId,
            line_item_id: lineItem.id,
            cart_id: cartId,
        },
    })

    if ('error' in data.data) {
        const regexpMatch = editBigCommerceLineItemRegExp.exec(data.data.error)

        throw new EditBigCommerceLineItemError(
            regexpMatch
                ? regexpMatch[2].trim()
                : BigCommerceErrorMessage.defaultError
        )
    }

    return data.data.cart
}

export async function editBigCommerceLineItemModifiers({
    integrationId,
    cartId,
    lineItem,
    quantity,
    optionSelections,
}: {
    integrationId: number
    cartId: string
    lineItem: BigCommerceCartLineItem
    quantity: number
    optionSelections: OptionSelection[]
}): Promise<BigCommerceCart> {
    const url = '/integrations/bigcommerce/order/line-item/modifiers'

    const payload = {
        product_id: lineItem.product_id,
        variant_id: lineItem.variant_id,
        option_selections: optionSelections,
        quantity,
    }

    const {data} = await client.put<EditLineItemResponse>(url, payload, {
        params: {
            integration_id: integrationId,
            line_item_id: lineItem.id,
            cart_id: cartId,
        },
    })

    if ('error' in data.data) {
        const regexpMatch = editBigCommerceLineItemRegExp.exec(data.data.error)

        throw new EditBigCommerceLineItemError(
            regexpMatch
                ? regexpMatch[2].trim()
                : BigCommerceErrorMessage.defaultError
        )
    }

    return data.data.cart
}

export async function removeBigCommerceLineItem(
    integrationId: number,
    cartId: string,
    lineItemId: string
): Promise<BigCommerceCart> {
    // Deletes a Cart line item or a custom line item.

    const url = '/integrations/bigcommerce/order/line-item/delete/'

    const response = await client.get<BigCommerceNestedCart>(url, {
        params: {
            integration_id: integrationId,
            cart_id: cartId,
            line_item_id: lineItemId,
        },
    })

    return response.data.data
}

export async function createBigCommerceCheckoutConsignment({
    integrationId,
    cartId,
    payload,
}: {
    integrationId: number
    cartId: string
    payload: Array<BigCommerceCreateConsignmentPayload>
}): Promise<BigCommerceCheckout> {
    const url = '/integrations/bigcommerce/order/checkout-consignment/'

    const response = await client.post<BigCommerceCheckout>(url, payload, {
        params: {
            integration_id: integrationId,
            checkout_id: cartId,
        },
    })

    return response.data
}

export async function updateBigCommerceCheckoutConsignment({
    integrationId,
    cartId,
    consignmentId,
    payload,
}: {
    integrationId: number
    cartId: string
    consignmentId: string
    payload: BigCommerceUpsertConsignmentPayload
}): Promise<BigCommerceCheckout> {
    const url = '/integrations/bigcommerce/order/checkout-consignment/'

    const response = await client.put<BigCommerceNestedCheckout>(url, payload, {
        params: {
            integration_id: integrationId,
            checkout_id: cartId,
            consignment_id: consignmentId,
        },
    })

    return response.data.data
}

export async function getBigCommerceCheckout({
    integrationId,
    checkoutId,
}: {
    integrationId: number
    checkoutId: string
}): Promise<BigCommerceCheckout> {
    const url = '/integrations/bigcommerce/order/checkout/'

    const response = await client.get<BigCommerceNestedCheckout>(url, {
        params: {
            integration_id: integrationId,
            checkout_id: checkoutId,
        },
    })

    return response.data.data
}

export async function updateBigCommerceCheckoutDiscount({
    integrationId,
    checkoutId,
    discountAmount,
}: {
    integrationId: number
    checkoutId: string
    discountAmount: number
}): Promise<BigCommerceCheckout> {
    const url = '/integrations/bigcommerce/order/discounts/'

    const payload = [{discounted_amount: discountAmount, name: 'Manual'}]

    const response = await client.post<BigCommerceCheckout>(url, payload, {
        params: {
            integration_id: integrationId,
            checkout_id: checkoutId,
        },
    })

    return response.data
}

export async function updateBigCommerceCoupon({
    integrationId,
    checkoutId,
    couponCode,
}: {
    integrationId: number
    checkoutId: string
    couponCode: string
}): Promise<BigCommerceCheckout> {
    const url = '/integrations/bigcommerce/order/coupons/'

    const payload = {coupon_code: couponCode}

    const response = await client.post<BigCommerceCheckout>(url, payload, {
        params: {
            integration_id: integrationId,
            checkout_id: checkoutId,
        },
    })

    return response.data
}

export async function deleteBigCommerceCoupon({
    integrationId,
    checkoutId,
    couponCode,
}: {
    integrationId: number
    checkoutId: string
    couponCode: string
}): Promise<BigCommerceCheckout> {
    const url = '/integrations/bigcommerce/order/coupons/delete/'

    /**
     * Using `get` here instead of `delete` because this is the way our backend is, sorry
     */
    const response = await client.get<BigCommerceNestedCheckout>(url, {
        params: {
            integration_id: integrationId,
            checkout_id: checkoutId,
            coupon_code: couponCode,
        },
    })

    return response.data.data
}
