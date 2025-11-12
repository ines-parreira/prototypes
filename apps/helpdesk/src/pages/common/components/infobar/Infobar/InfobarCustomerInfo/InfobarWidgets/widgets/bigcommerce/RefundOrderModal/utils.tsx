import React, { Dispatch, Fragment, ReactNode } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { List as ImmutableList, Map as ImmutableMap } from 'immutable'
import _debounce from 'lodash/debounce'

import {
    getBigCommerceAvailablePaymentOptionsData,
    getBigCommerceOrderRefundData,
} from 'models/integration/resources/bigcommerce'
import {
    BigCommerceActionType,
    BigCommerceAvailablePaymentOptionsData,
    BigCommerceGeneralError,
    BigCommerceGeneralErrorMessage,
    BigCommerceIntegration,
    BigCommerceOrderProduct,
    BigCommerceRefundableItemType,
    BigCommerceRefundItemsPayload,
    BigCommerceRefundMethod,
    BigCommerceRefundMethodComponent,
    BigCommerceRefundType,
    GiftWrappingItemRefundData,
    ProductItemRefundData,
} from 'models/integration/types'
import { executeAction } from 'state/infobar/actions'
import { ActionDataPayload } from 'state/infobar/utils'
import { fetchIntegrationProducts } from 'state/integrations/helpers'
import { StoreDispatch } from 'state/types'

import {
    BIGCOMMERCE_REFUND_ACTION_TYPE,
    BigCommerceRefundActionType,
} from './types'

export const onReset = _debounce(
    ({
        dispatchRefundOrderState,
    }: {
        dispatchRefundOrderState: Dispatch<BIGCOMMERCE_REFUND_ACTION_TYPE>
    }) => {
        dispatchRefundOrderState({
            type: BigCommerceRefundActionType.ResetState,
        })

        logEvent(SegmentEvent.BigCommerceRefundOrderResetModal)
    },
    250,
)

/**
 * Fetch image URLs for given products
 */
export const fetchProductImageURLs = async ({
    integrationId,
    productRefundData,
}: {
    integrationId: number
    productRefundData: Record<string, ProductItemRefundData>
}): Promise<Record<string, Maybe<string>>> => {
    const productImageURLs: Record<string, Maybe<string>> = {}
    const productsIds: number[] = []

    Object.values(productRefundData).forEach(
        (refundData: ProductItemRefundData) => {
            productsIds.push(refundData.product_data.product_id)
        },
    )

    const integrationProducts = await fetchIntegrationProducts(
        integrationId,
        productsIds,
    )

    Object.entries(productRefundData).forEach(
        ([refundedProductId, refundData]: [string, ProductItemRefundData]) => {
            const productId = refundData.product_data.product_id
            const variantId = refundData.product_data.variant_id

            const productWithVariants = integrationProducts.find(
                (product: ImmutableMap<string, any>) =>
                    product.get('id') === productId,
            )

            const product =
                productWithVariants && productWithVariants.get('variants')
                    ? (
                          productWithVariants.get('variants') as ImmutableList<
                              ImmutableMap<string, any>
                          >
                      ).find((variant) => variant?.get('id') === variantId)
                    : null

            productImageURLs[refundedProductId] =
                product?.get('image_url') ||
                productWithVariants?.get('image_url')
        },
    )

    return productImageURLs
}

/**
 * Calculate refund of given order & initialize the modal.
 * */
export const calculateOrderRefund = async ({
    integrationId,
    customerId,
    orderId,
    dispatchRefundOrderState,
    setIsLoading,
    setErrorMessage,
}: {
    integrationId: number
    customerId: number
    orderId: number
    dispatchRefundOrderState: Dispatch<BIGCOMMERCE_REFUND_ACTION_TYPE>
    setIsLoading: (isLoading: boolean) => void
    setErrorMessage: (errorMessage: string) => void
}) => {
    setIsLoading(true)

    try {
        const data = await getBigCommerceOrderRefundData({
            integrationId,
            customerId,
            orderId,
        })
        let productImageURLs: Record<string, Maybe<string>> = {}

        if (data.individual_items_level_refund_data?.PRODUCT) {
            productImageURLs = await fetchProductImageURLs({
                integrationId,
                productRefundData:
                    data.individual_items_level_refund_data.PRODUCT,
            })
        }

        dispatchRefundOrderState({
            type: BigCommerceRefundActionType.SetInitialRefundData,
            refundData: data,
            productImageURLs: productImageURLs,
        })

        logEvent(SegmentEvent.BigCommerceRefundOrderOpen)
    } catch (error) {
        // Error Handling
        setErrorMessage(
            error instanceof BigCommerceGeneralError
                ? error.message
                : BigCommerceGeneralErrorMessage.defaultError,
        )
    } finally {
        setIsLoading(false)
    }
}

/**
 * Calculate available refund methods of given order & items to refund.
 * */
export const calculateAvailablePaymentOptionsData = async ({
    integrationId,
    customerId,
    orderId,
    refundItemsPayload,
    dispatchRefundOrderState,
    setIsLoading,
    setErrorMessage,
}: {
    integrationId: number
    customerId: number
    orderId: number
    refundItemsPayload: BigCommerceRefundItemsPayload
    dispatchRefundOrderState: Dispatch<BIGCOMMERCE_REFUND_ACTION_TYPE>
    setIsLoading: (isLoading: boolean) => void
    setErrorMessage: (errorMessage: string) => void
}) => {
    setIsLoading(true)

    try {
        const data: BigCommerceAvailablePaymentOptionsData =
            await getBigCommerceAvailablePaymentOptionsData({
                integrationId,
                customerId,
                orderId,
                payload: refundItemsPayload,
            })

        dispatchRefundOrderState({
            type: BigCommerceRefundActionType.SetAvailablePaymentOptionsData,
            availablePaymentOptionsData: data,
        })

        logEvent(SegmentEvent.BigCommerceRefundOrderOpen)
    } catch (error) {
        // Error Handling
        setErrorMessage(
            error instanceof BigCommerceGeneralError
                ? error.message
                : BigCommerceGeneralErrorMessage.defaultError,
        )
    } finally {
        setIsLoading(false)
    }
}

/**
 * Send a `bigcommerceRefundOrder` action that will result in refunding an existing order from BigCommerce.
 */
export function bigcommerceRefundOrder(
    actionName: BigCommerceActionType,
    dispatch: StoreDispatch,
    integration: BigCommerceIntegration,
    customerId: Maybe<string>,
    orderId: number,
    refundType: BigCommerceRefundType,
    refundItemsPayload: BigCommerceRefundItemsPayload,
    selectedPaymentOption: BigCommerceRefundMethod,
    refundReason: Maybe<string>,
    newOrderStatus: Maybe<string>,
) {
    const payload: ActionDataPayload = {
        bigcommerce_order_id: orderId,
        bigcommerce_refund_payload: {
            items: refundItemsPayload.items,
            reason: refundReason,
            payments: selectedPaymentOption,
        },
        bigcommerce_new_order_status: newOrderStatus,
        bigcommerce_refund_type: refundType,
    }

    dispatch(
        executeAction({
            actionName: actionName,
            integrationId: integration.id,
            customerId: customerId?.toString(),
            payload: payload,
        }),
    )
}

/**
 * Calculate the total order amount.
 * */
export function calculateTotalOrderAmount(
    order: ImmutableMap<any, any>,
): number {
    return (
        parseFloat(order.get('total_inc_tax')) +
        parseFloat(order.get('store_credit_amount')) +
        parseFloat(order.get('gift_certificate_amount'))
    )
}

/**
 * Check whether an order is fully refunded.
 * */
export function isOrderFullyRefunded(order: ImmutableMap<any, any>): boolean {
    const orderTotal = calculateTotalOrderAmount(order)
    const refundedAmount = parseFloat(order.get('refunded_amount'))

    return orderTotal === refundedAmount || orderTotal - refundedAmount < 0.01
}

export function formatAmount(
    currencyCode: Maybe<string>,
    availableAmount: number,
): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode || 'USD',
        currencyDisplay: 'symbol',
        maximumFractionDigits: 2,
    }).format(availableAmount)
}

export function buildPaymentOptionLabel(
    paymentOption: BigCommerceRefundMethod,
    currencyCode: Maybe<string>,
): ReactNode {
    return (
        <div>
            {paymentOption.map(
                (option: BigCommerceRefundMethodComponent, index: number) => {
                    if (paymentOption.length === 1) {
                        return (
                            <Fragment key={index}>
                                <b>{`${option.provider_description}`}</b>
                            </Fragment>
                        )
                    }
                    return (
                        <Fragment key={index}>
                            <b>{`${option.provider_description}: `}</b>
                            {formatAmount(currencyCode, option.amount)}
                            {index >= 0 &&
                                paymentOption.length > 1 &&
                                index !== paymentOption.length - 1 && <br />}
                        </Fragment>
                    )
                },
            )}
        </div>
    )
}

export function formatPrice(price: string | number): number {
    // BigCommerce error: "amount field can not have more than 2 decimal digits"
    // return Math.round((parseFloat(price) + Number.EPSILON) * 100) / 100
    return (
        Math.round(
            ((typeof price === 'string' ? parseFloat(price) : price) +
                Number.EPSILON) *
                100,
        ) / 100
    )
}

export function calculateProductPrice(
    product: BigCommerceOrderProduct,
): number {
    let initialTotalPriceFloat: number = parseFloat(product.base_total)
    product.applied_discounts.map((discount) => {
        initialTotalPriceFloat -= parseFloat(discount.amount)
    })
    return initialTotalPriceFloat / product.quantity
}

export function calculateGiftWrappingPrice(
    product: BigCommerceOrderProduct,
): number {
    return parseFloat(product.base_wrapping_cost) / product.quantity
}

export function calculateOrderSubtotal(
    refundItemsPayload: Maybe<BigCommerceRefundItemsPayload>,
    productRefundData: Record<string, ProductItemRefundData>,
    giftWrappingRefundData: Record<string, GiftWrappingItemRefundData>,
    includeShippingHandling = false,
): number {
    if (!refundItemsPayload?.items?.length) {
        return 0
    }
    let subtotal = 0

    refundItemsPayload.items.map((item) => {
        if (item.item_type === BigCommerceRefundableItemType.product) {
            const productData = productRefundData[String(item.item_id)]
            const productAvailableQuantity =
                productData?.available_quantity || 0
            const productPrice = productData
                ? calculateProductPrice(productData.product_data)
                : 0

            subtotal += productPrice * productAvailableQuantity
        } else if (
            item.item_type === BigCommerceRefundableItemType.gift_wrapping
        ) {
            const productData = productRefundData[String(item.item_id)]
            const giftWrappingData =
                giftWrappingRefundData[String(item.item_id)]
            const giftWrappingAvailableQuantity =
                giftWrappingData?.available_quantity || 0
            const giftWrappingPrice = productData
                ? calculateGiftWrappingPrice(productData.product_data)
                : 0

            subtotal += giftWrappingPrice * giftWrappingAvailableQuantity
        } else if (
            includeShippingHandling &&
            item.item_type === BigCommerceRefundableItemType.shipping
        ) {
            subtotal += item?.amount || 0
        } else if (
            includeShippingHandling &&
            item.item_type === BigCommerceRefundableItemType.handling
        ) {
            subtotal += item?.amount || 0
        }
    })

    return subtotal
}

export function calculateOrderTotal(
    refundItemsPayload: Maybe<BigCommerceRefundItemsPayload>,
    productRefundData: Record<string, ProductItemRefundData>,
    giftWrappingRefundData: Record<string, GiftWrappingItemRefundData>,
    availablePaymentOptionsData: Maybe<BigCommerceAvailablePaymentOptionsData>,
): number {
    return (
        calculateOrderSubtotal(
            refundItemsPayload,
            productRefundData,
            giftWrappingRefundData,
            true,
        ) + (availablePaymentOptionsData?.total_refund_tax_amount || 0)
    )
}
