import {AxiosError} from 'axios'
import client from 'models/api/resources'

import {
    BigCommerceCart,
    BigCommerceCartLineItem,
    BigCommerceCustomCartLineItem,
    BigCommerceCustomerAddress,
    BigCommerceCheckout,
    BigCommerceCreateConsignmentPayload,
    BigCommerceUpsertConsignmentPayload,
    BigCommerceCustomProduct,
    BigCommerceGeneralErrorMessage,
    BigCommerceCartResponse,
    BigCommerceNestedCartResponse,
    BigCommerceCheckoutResponse,
    BigCommerceNestedCheckoutResponse,
    BigCommerceCouponErrorMessage,
    BigCommerceCouponError,
    BigCommerceGeneralError,
    BigCommerceLineItemErrorMessage,
    ProductModifiersChangedError,
    BigCommerceLineItemError,
    BigCommerceCartErrorResponse,
    BigCommerceCheckoutErrorResponse,
    BigCommerceCartRedirect,
    BigCommerceDuplicateOrderResponse,
    BigCommerceDuplicateOrderErrorResponse,
    BigCommerceAddressResponse,
    BigCommerceCustomAddress,
    CalculateOrderRefundDataResponse,
    CalculateOrderRefundDataErrorResponse,
    CalculateOrderRefundDataNestedResponse,
    CalculateOrderRefundQuotesDataResponse,
    BigCommerceAvailablePaymentOptionsData,
    BigCommerceRefundItemsPayload,
    CalculateOrderRefundQuotesDataErrorResponse,
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

    return await client
        .post<BigCommerceCartResponse>(url, payload, {
            params: {
                integration_id: integrationId,
            },
        })
        .then((response) => {
            if (!('cart' in response.data) || !response.data.cart) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.defaultError
                )
            }

            return response.data.cart
        })
        .catch((error: AxiosError<BigCommerceCartErrorResponse>) => {
            const {response} = error

            if (response?.status === 429) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.rateLimitingError
                )
            }

            throw new BigCommerceGeneralError(
                BigCommerceGeneralErrorMessage.defaultError
            )
        })
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

    return await client
        .post<BigCommerceCheckoutResponse>(url, payload, {
            params: {
                integration_id: integrationId,
                cart_id: cartId,
            },
        })
        .then((response) => {
            if (!('checkout' in response.data) || !response.data.checkout) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.defaultError
                )
            }

            return response.data.checkout
        })
        .catch((error: AxiosError<BigCommerceCheckoutErrorResponse>) => {
            const {response} = error

            if (response?.status === 429) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.rateLimitingError
                )
            }

            throw new BigCommerceGeneralError(
                BigCommerceGeneralErrorMessage.defaultError
            )
        })
}

export async function addBigCommerceCustomAddressToCustomerAddressBook({
    integrationId,
    address,
}: {
    integrationId: number
    address: BigCommerceCustomAddress
}): Promise<BigCommerceCustomerAddress> {
    const url = '/integrations/bigcommerce/order/address/'

    return await client
        .post<BigCommerceAddressResponse>(url, [address], {
            params: {
                integration_id: integrationId,
            },
        })
        .then((response) => {
            if (!('address' in response.data) || !response.data.address) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.defaultError
                )
            }

            return response.data.address
        })
        .catch((error) => {
            const {response} =
                error as AxiosError<BigCommerceCheckoutErrorResponse>

            if (response?.status === 429) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.rateLimitingError
                )
            }

            throw new BigCommerceGeneralError(
                BigCommerceGeneralErrorMessage.defaultError
            )
        })
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

    return await client
        .post<BigCommerceCartResponse>(url, payload, {
            params: {
                integration_id: integrationId,
                cart_id: cartId,
            },
        })
        .then((response) => {
            if (!('cart' in response.data) || !response.data.cart) {
                throw new BigCommerceLineItemError(
                    BigCommerceLineItemErrorMessage.defaultAddLineItemError
                )
            }

            return response.data.cart
        })
        .catch((error: AxiosError<BigCommerceCartErrorResponse>) => {
            const {response} = error

            if (response?.status === 429) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.rateLimitingError
                )
            }

            if (
                response?.data?.error?.data?.updated_product &&
                response.data.error.data.updated_product.availability ===
                    'available'
            ) {
                // To prevent this case (availability = 'disabled'):
                // Purchasability -> This product cannot be purchased in my online store
                throw new ProductModifiersChangedError(
                    response.data.error.data.updated_product
                )
            }

            if (
                response?.data.error?.data?.updated_product &&
                response.data.error.data.updated_product.availability ===
                    'disabled'
            ) {
                // Purchasability -> This product cannot be purchased in my online store
                throw new BigCommerceLineItemError(
                    BigCommerceLineItemErrorMessage.onlyOfflineAvailabilityError
                )
            }

            if (response?.data?.error?.msg) {
                throw new BigCommerceLineItemError(
                    Object.values(BigCommerceLineItemErrorMessage)?.includes(
                        response.data.error
                            .msg as BigCommerceLineItemErrorMessage
                    )
                        ? response.data.error.msg
                        : BigCommerceLineItemErrorMessage.defaultAddLineItemError
                )
            }

            throw new BigCommerceLineItemError(
                BigCommerceLineItemErrorMessage.defaultAddLineItemError
            )
        })
}

export async function editBigCommerceLineItem({
    integrationId,
    cartId,
    lineItem,
    quantity,
    listPrice,
    defaultError = BigCommerceLineItemErrorMessage.defaultUpdateLineItemError,
}: {
    integrationId: number
    cartId: string
    lineItem: BigCommerceCartLineItem
    quantity: number
    listPrice?: number
    defaultError?: BigCommerceLineItemErrorMessage
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

    return await client
        .put<BigCommerceNestedCartResponse>(url, payload, {
            params: {
                integration_id: integrationId,
                line_item_id: lineItem.id,
                cart_id: cartId,
            },
        })
        .then((response) => {
            if (
                !('data' in response.data) ||
                !response.data.data ||
                !('cart' in response.data.data) ||
                !response.data.data.cart
            ) {
                throw new BigCommerceLineItemError(defaultError)
            }

            return response.data.data.cart
        })
        .catch((error: AxiosError<BigCommerceCartErrorResponse>) => {
            const {response} = error

            if (response?.status === 429) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.rateLimitingError
                )
            }

            if (response?.data?.error?.msg) {
                throw new BigCommerceLineItemError(
                    Object.values(BigCommerceLineItemErrorMessage)?.includes(
                        response.data.error
                            .msg as BigCommerceLineItemErrorMessage
                    )
                        ? response.data.error.msg
                        : defaultError
                )
            }

            throw new BigCommerceLineItemError(defaultError)
        })
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
    const url = '/integrations/bigcommerce/order/line-item/modifiers/'

    const payload = {
        product_id: lineItem.product_id,
        variant_id: lineItem.variant_id,
        option_selections: optionSelections,
        quantity,
        list_price: lineItem.list_price,
    }

    return await client
        .put<BigCommerceNestedCartResponse>(url, payload, {
            params: {
                integration_id: integrationId,
                line_item_id: lineItem.id,
                cart_id: cartId,
            },
        })
        .then((response) => {
            if (
                !('data' in response.data) ||
                !response.data.data ||
                !('cart' in response.data.data) ||
                !response.data.data.cart
            ) {
                throw new BigCommerceLineItemError(
                    BigCommerceLineItemErrorMessage.defaultUpdateLineItemError
                )
            }

            return response.data.data.cart
        })
        .catch((error: AxiosError<BigCommerceCartErrorResponse>) => {
            const {response} = error

            if (response?.status === 429) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.rateLimitingError
                )
            }

            if (response?.data?.error?.msg) {
                throw new BigCommerceLineItemError(
                    Object.values(BigCommerceLineItemErrorMessage)?.includes(
                        response.data.error
                            .msg as BigCommerceLineItemErrorMessage
                    )
                        ? response.data.error.msg
                        : BigCommerceLineItemErrorMessage.defaultUpdateLineItemError
                )
            }

            throw new BigCommerceLineItemError(
                BigCommerceLineItemErrorMessage.defaultUpdateLineItemError
            )
        })
}

export async function removeBigCommerceLineItem(
    integrationId: number,
    cartId: string,
    lineItemId: string
): Promise<BigCommerceCart> {
    // Deletes a Cart line item or a custom line item.

    const url = '/integrations/bigcommerce/order/line-item/delete/'

    return await client
        .get<BigCommerceNestedCartResponse>(url, {
            params: {
                integration_id: integrationId,
                cart_id: cartId,
                line_item_id: lineItemId,
            },
        })
        .then((result) => {
            if (
                !('data' in result.data) ||
                !result.data.data ||
                !('cart' in result.data.data) ||
                !result.data.data.cart
            ) {
                throw new BigCommerceLineItemError(
                    BigCommerceLineItemErrorMessage.defaultRemoveLineItemError
                )
            }

            return result.data.data.cart
        })
        .catch((error: AxiosError<BigCommerceCartErrorResponse>) => {
            const {response} = error

            if (response?.status === 429) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.rateLimitingError
                )
            }

            throw new BigCommerceLineItemError(
                BigCommerceLineItemErrorMessage.defaultRemoveLineItemError
            )
        })
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

    return await client
        .post<BigCommerceCheckoutResponse>(url, payload, {
            params: {
                integration_id: integrationId,
                checkout_id: cartId,
            },
        })
        .then((response) => {
            if (!('checkout' in response.data) || !response.data.checkout) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.defaultError
                )
            }

            return response.data.checkout
        })
        .catch((error: AxiosError<BigCommerceCheckoutErrorResponse>) => {
            const {response} = error

            if (response?.status === 429) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.rateLimitingError
                )
            }

            throw new BigCommerceGeneralError(
                BigCommerceGeneralErrorMessage.defaultError
            )
        })
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

    return await client
        .put<BigCommerceNestedCheckoutResponse>(url, payload, {
            params: {
                integration_id: integrationId,
                checkout_id: cartId,
                consignment_id: consignmentId,
            },
        })
        .then((response) => {
            if (
                !('data' in response.data) ||
                !response.data.data ||
                !('checkout' in response.data.data) ||
                !response.data.data.checkout
            ) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.defaultError,
                    response.status
                )
            }

            return response.data.data.checkout
        })
        .catch((error: AxiosError<BigCommerceCheckoutErrorResponse>) => {
            const {response} = error

            if (response?.status === 429) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.rateLimitingError
                )
            }

            throw new BigCommerceGeneralError(
                BigCommerceGeneralErrorMessage.defaultError,
                response?.status
            )
        })
}

export async function getBigCommerceCheckout({
    integrationId,
    checkoutId,
}: {
    integrationId: number
    checkoutId: string
}): Promise<BigCommerceCheckout> {
    const url = '/integrations/bigcommerce/order/checkout/'

    return await client
        .get<BigCommerceNestedCheckoutResponse>(url, {
            params: {
                integration_id: integrationId,
                checkout_id: checkoutId,
            },
        })
        .then((response) => {
            if (
                !('data' in response.data) ||
                !response.data.data ||
                !('checkout' in response.data.data) ||
                !response.data.data.checkout
            ) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.defaultError
                )
            }

            return response.data.data.checkout
        })
        .catch((error: AxiosError<BigCommerceCheckoutErrorResponse>) => {
            const {response} = error

            if (response?.status === 429) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.rateLimitingError
                )
            }

            throw new BigCommerceGeneralError(
                BigCommerceGeneralErrorMessage.defaultError
            )
        })
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

    return await client
        .post<BigCommerceCheckoutResponse>(url, payload, {
            params: {
                integration_id: integrationId,
                checkout_id: checkoutId,
            },
        })
        .then((response) => {
            if (!('checkout' in response.data) || !response.data.checkout) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.defaultError
                )
            }

            return response.data.checkout
        })
        .catch((error: AxiosError<BigCommerceCheckoutErrorResponse>) => {
            const {response} = error

            if (response?.status === 429) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.rateLimitingError
                )
            }

            throw new BigCommerceGeneralError(
                BigCommerceGeneralErrorMessage.defaultError
            )
        })
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

    return await client
        .post<BigCommerceCheckoutResponse>(url, payload, {
            params: {
                integration_id: integrationId,
                checkout_id: checkoutId,
            },
        })
        .then((response) => {
            if (!('checkout' in response.data) || !response.data.checkout) {
                throw new BigCommerceCouponError(
                    BigCommerceCouponErrorMessage.defaultCouponError
                )
            }

            return response.data.checkout
        })
        .catch((error: AxiosError<BigCommerceCheckoutErrorResponse>) => {
            const {response} = error

            if (response?.status === 429) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.rateLimitingError
                )
            }

            if (response?.data?.error?.msg) {
                throw new BigCommerceCouponError(
                    Object.values(BigCommerceCouponErrorMessage)?.includes(
                        response.data.error.msg as BigCommerceCouponErrorMessage
                    )
                        ? response.data.error.msg
                        : BigCommerceCouponErrorMessage.defaultCouponError
                )
            }

            throw new BigCommerceCouponError(
                BigCommerceCouponErrorMessage.defaultCouponError
            )
        })
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
    return await client
        .get<BigCommerceNestedCheckoutResponse>(url, {
            params: {
                integration_id: integrationId,
                checkout_id: checkoutId,
                coupon_code: couponCode,
            },
        })
        .then((response) => {
            if (
                !('data' in response.data) ||
                !response.data.data ||
                !('checkout' in response.data.data) ||
                !response.data.data.checkout
            ) {
                throw new BigCommerceCouponError(
                    BigCommerceCouponErrorMessage.defaultCouponError
                )
            }

            return response.data.data.checkout
        })
        .catch((error: AxiosError<BigCommerceCheckoutErrorResponse>) => {
            const {response} = error

            if (response?.status === 429) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.rateLimitingError
                )
            }

            if (response?.data?.error?.msg) {
                throw new BigCommerceCouponError(
                    Object.values(BigCommerceCouponErrorMessage)?.includes(
                        response.data.error.msg as BigCommerceCouponErrorMessage
                    )
                        ? response.data.error.msg
                        : BigCommerceCouponErrorMessage.defaultCouponError
                )
            }

            throw new BigCommerceCouponError(
                BigCommerceCouponErrorMessage.defaultCouponError
            )
        })
}

export async function getBigCommerceDraftOrderUrl({
    integrationId,
    cartId,
    customerId,
}: {
    integrationId: number
    cartId: string
    customerId?: number
}): Promise<string> {
    const url = '/integrations/bigcommerce/order/cart/redirect/'
    const response = await client.post<BigCommerceCartRedirect>(
        url,
        {},
        {
            params: {
                integration_id: integrationId,
                cart_id: cartId,
                update_customer_data: customerId,
            },
        }
    )

    return response.data.data
}

export async function createCartFromOrder({
    integrationId,
    customerId,
    bigcommerceOrderId,
}: {
    integrationId: number
    customerId: number
    bigcommerceOrderId: number
}): Promise<{
    cart: Maybe<BigCommerceCart>
    checkout: Maybe<BigCommerceCheckout>
    missingLineItems: Maybe<
        Array<{
            line_item: BigCommerceCartLineItem | BigCommerceCustomCartLineItem
            error: string
        }>
    >
}> {
    const url = '/integrations/bigcommerce/order/cart/duplicate/'

    return await client
        .post<BigCommerceDuplicateOrderResponse>(
            url,
            {},
            {
                params: {
                    integration_id: integrationId,
                    customer_id: customerId,
                    bigcommerce_order_id: bigcommerceOrderId,
                },
            }
        )
        .then((response) => {
            if (
                !response.data ||
                !('cart' in response.data) ||
                !('checkout' in response.data) ||
                (!response.data.cart?.currency &&
                    !response.data.missing_line_items?.length)
            ) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.defaultError
                )
            }

            return {
                cart: response.data.cart,
                checkout: response.data.checkout,
                missingLineItems: response.data.missing_line_items,
            }
        })
        .catch((error: AxiosError<BigCommerceDuplicateOrderErrorResponse>) => {
            const {response} = error

            if (response?.status === 429) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.rateLimitingError
                )
            }

            throw new BigCommerceGeneralError(
                BigCommerceGeneralErrorMessage.defaultError
            )
        })
}

export async function getBigCommerceOrderRefundData({
    integrationId,
    customerId,
    orderId,
}: {
    integrationId: number
    customerId: number
    orderId: number
}): Promise<CalculateOrderRefundDataResponse> {
    const url = `/integrations/bigcommerce/order/${orderId}/refund/calculate/`

    return await client
        .get<CalculateOrderRefundDataNestedResponse>(url, {
            params: {
                integration_id: integrationId,
                customer_id: customerId,
            },
        })
        .then((response) => {
            if (
                !('data' in response.data) ||
                !response.data?.data?.order?.id ||
                !response.data?.data?.order_level_refund_data
            ) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.defaultError
                )
            }

            return response.data.data
        })
        .catch((error: AxiosError<CalculateOrderRefundDataErrorResponse>) => {
            const {response} = error

            if (response?.status === 429) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.rateLimitingError
                )
            }

            throw new BigCommerceGeneralError(
                BigCommerceGeneralErrorMessage.defaultError
            )
        })
}

export async function getBigCommerceAvailablePaymentOptionsData({
    integrationId,
    customerId,
    orderId,
    payload,
}: {
    integrationId: number
    customerId: number
    orderId: number
    payload: BigCommerceRefundItemsPayload
}): Promise<BigCommerceAvailablePaymentOptionsData> {
    const url = `/integrations/bigcommerce/order/${orderId}/refund/refund_quotes/`

    return await client
        .post<CalculateOrderRefundQuotesDataResponse>(url, payload, {
            params: {
                integration_id: integrationId,
                customer_id: customerId,
            },
        })
        .then((response) => {
            if (!response.data || !('refund_methods' in response.data)) {
                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.defaultError
                )
            }

            return response.data
        })
        .catch(
            (
                error: AxiosError<CalculateOrderRefundQuotesDataErrorResponse>
            ) => {
                const {response} = error

                if (response?.status === 429) {
                    throw new BigCommerceGeneralError(
                        BigCommerceGeneralErrorMessage.rateLimitingError
                    )
                }

                if (response?.data?.error?.msg) {
                    throw new BigCommerceGeneralError(
                        new RegExp(
                            `Order with ID ${orderId} can not be refunded.$`,
                            'i'
                        ).test(response.data.error.msg)
                            ? BigCommerceGeneralErrorMessage.defaultRefundError
                            : BigCommerceGeneralErrorMessage.defaultError
                    )
                }

                throw new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.defaultError
                )
            }
        )
}
