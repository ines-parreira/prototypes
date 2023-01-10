import client from 'models/api/resources'

import {
    BigCommerceCart,
    BigCommerceCartLineItem,
    BigCommerceCustomerAddress,
    BigCommerceNestedCart,
    BigCommerceCheckout,
    BigCommerceCreateConsignmentPayload,
    BigCommerceUpsertConsignmentPayload,
    BigCommerceNestedCheckout,
} from '../types'

export async function createBigCommerceCart(
    integrationId: number,
    customerId: number
): Promise<BigCommerceCart> {
    const url = '/integrations/bigcommerce/order/cart/'

    const payload = {
        customer_id: customerId,
        line_items: [],
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

export async function addBigCommerceLineItem(
    integrationId: number,
    cartId: string,
    productId: number,
    variantId: number
): Promise<BigCommerceCart> {
    const url = '/integrations/bigcommerce/order/line-item/'

    const payload = {
        line_items: [
            {
                product_id: productId,
                variant_id: variantId,
                quantity: 1,
            },
        ],
    }

    const response = await client.post<BigCommerceCart>(url, payload, {
        params: {
            integration_id: integrationId,
            cart_id: cartId,
        },
    })

    return response.data
}

export async function editBigCommerceLineItem(
    integrationId: number,
    cartId: string,
    lineItem: BigCommerceCartLineItem,
    newQuantity: number
): Promise<BigCommerceCart> {
    const url = '/integrations/bigcommerce/order/line-item/'

    const payload = {
        line_item: {
            product_id: lineItem.product_id,
            variant_id: lineItem.variant_id,
            quantity: newQuantity,
        },
    }

    const response = await client.put<BigCommerceNestedCart>(url, payload, {
        params: {
            integration_id: integrationId,
            line_item_id: lineItem.id,
            cart_id: cartId,
        },
    })

    return response.data.data
}

export async function removeBigCommerceLineItem(
    integrationId: number,
    cartId: string,
    lineItemId: string
): Promise<BigCommerceCart> {
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
