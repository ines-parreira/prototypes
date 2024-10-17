import {Reducer} from 'react'
import {produce} from 'immer'

import {
    BigCommerceRefundOrderState,
    BigCommerceRefundableItemType,
    BigCommerceRefundItemsPayloadComponent,
    GiftWrappingItemRefundData,
    HandlingItemRefundData,
    ProductItemRefundData,
    ShippingItemRefundData,
} from 'models/integration/types'
import {formatPrice} from './utils'
import {defaultBigCommerceRefundType} from './consts'
import {
    BIGCOMMERCE_REFUND_ACTION_TYPE,
    BigCommerceRefundActionType,
} from './types'

export const initialBigCommerceRefundOrderState: BigCommerceRefundOrderState = {
    refundData: {
        order: null,
        order_level_refund_data: null,
        individual_items_level_refund_data: null,
    },
    refundType: defaultBigCommerceRefundType,
    refundItemsPayload: null,
    productImageURLs: {},
    totalAmountToRefund: 0,
    availablePaymentOptionsData: null,
    selectedPaymentOption: null,
    refundReason: '',
    newOrderStatus: null,
}

export const bigcommerceRefundOrderReducer: Reducer<
    BigCommerceRefundOrderState,
    BIGCOMMERCE_REFUND_ACTION_TYPE
> = (state, action) => {
    switch (action.type) {
        case BigCommerceRefundActionType.ResetState: {
            return initialBigCommerceRefundOrderState
        }
        case BigCommerceRefundActionType.ResetRefundMethodState: {
            return {
                ...state,
                refundItemsPayload:
                    initialBigCommerceRefundOrderState.refundItemsPayload,
                totalAmountToRefund:
                    initialBigCommerceRefundOrderState.totalAmountToRefund,
                availablePaymentOptionsData:
                    initialBigCommerceRefundOrderState.availablePaymentOptionsData,
                selectedPaymentOption:
                    initialBigCommerceRefundOrderState.selectedPaymentOption,
            }
        }
        case BigCommerceRefundActionType.SetInitialRefundData:
            return {
                ...state,
                refundData: action.refundData,
                productImageURLs: action.productImageURLs,
            }
        case BigCommerceRefundActionType.SetRefundType:
            return {
                ...state,
                refundType: action.refundType,
            }
        case BigCommerceRefundActionType.SetTotalAmountToRefund:
            return {
                ...state,
                totalAmountToRefund: action.totalAmountToRefund,
            }
        case BigCommerceRefundActionType.SetAvailablePaymentOptionsData:
            return {
                ...state,
                availablePaymentOptionsData: action.availablePaymentOptionsData,
            }
        case BigCommerceRefundActionType.SetSelectedPaymentOption:
            return {
                ...state,
                selectedPaymentOption: action.selectedPaymentOption,
            }
        case BigCommerceRefundActionType.SetRefundReason:
            return {
                ...state,
                refundReason: action.refundReason,
            }
        case BigCommerceRefundActionType.SetNewOrderStatus:
            return {
                ...state,
                newOrderStatus: action.newOrderStatus,
            }
        case BigCommerceRefundActionType.SetRefundItemsPayloadEmptyList:
            return {
                ...state,
                refundItemsPayload: {
                    items: [],
                },
            }
        case BigCommerceRefundActionType.ManualAmount:
            return {
                ...state,
                refundItemsPayload: {
                    items: [action.refundOrderItemPayload],
                },
            }
        case BigCommerceRefundActionType.EntireOrder: {
            const productRefundData =
                action.refundData.individual_items_level_refund_data?.PRODUCT
            const giftWrappingRefundData =
                action.refundData.individual_items_level_refund_data
                    ?.GIFT_WRAPPING

            const productItems: BigCommerceRefundItemsPayloadComponent[] = []
            const giftWrappingItems: BigCommerceRefundItemsPayloadComponent[] =
                []

            if (productRefundData && giftWrappingRefundData) {
                Object.entries(productRefundData).forEach(
                    ([refundedProductId, refundData]: [
                        string,
                        ProductItemRefundData,
                    ]) => {
                        if (refundData.available_quantity > 0) {
                            productItems.push({
                                item_type:
                                    BigCommerceRefundableItemType.product,
                                item_id: parseFloat(refundedProductId),
                                quantity: refundData.available_quantity,
                            })
                        }
                    }
                )
                Object.entries(giftWrappingRefundData).forEach(
                    ([refundedProductId, refundData]: [
                        string,
                        GiftWrappingItemRefundData,
                    ]) => {
                        if (refundData.available_quantity > 0) {
                            giftWrappingItems.push({
                                item_type:
                                    BigCommerceRefundableItemType.gift_wrapping,
                                item_id: parseFloat(refundedProductId),
                                quantity: refundData.available_quantity,
                            })
                        }
                    }
                )
            }
            return {
                ...state,
                refundItemsPayload: {
                    items: [...productItems, ...giftWrappingItems],
                },
            }
        }
        case BigCommerceRefundActionType.EntireOrderAddShipping: {
            return produce(state, (draft: BigCommerceRefundOrderState) => {
                if (!draft?.refundItemsPayload?.items) {
                    return draft
                }

                Object.entries(action.shippingRefundData).forEach(
                    ([refundedShippingId, refundData]: [
                        string,
                        ShippingItemRefundData,
                    ]) => {
                        if (!action.isShippingCostRefunded) {
                            if (draft.refundItemsPayload?.items.length) {
                                draft.refundItemsPayload.items =
                                    draft.refundItemsPayload.items.filter(
                                        (
                                            item: BigCommerceRefundItemsPayloadComponent
                                        ) =>
                                            !(
                                                item.item_id ===
                                                    parseFloat(
                                                        refundedShippingId
                                                    ) &&
                                                item.item_type ===
                                                    BigCommerceRefundableItemType.shipping
                                            )
                                    )
                            }
                        } else {
                            if (refundData.available_amount > 0) {
                                draft.refundItemsPayload?.items.push({
                                    item_type:
                                        BigCommerceRefundableItemType.shipping,
                                    item_id: parseFloat(refundedShippingId),
                                    amount: formatPrice(
                                        refundData.available_amount
                                    ),
                                })
                            }
                        }
                    }
                )
                return draft
            })
        }
        case BigCommerceRefundActionType.EntireOrderAddHandling: {
            return produce(state, (draft: BigCommerceRefundOrderState) => {
                if (!draft?.refundItemsPayload?.items) {
                    return draft
                }

                Object.entries(action.handlingRefundData).forEach(
                    ([refundedShippingId, refundData]: [
                        string,
                        HandlingItemRefundData,
                    ]) => {
                        if (!action.isHandlingFeeRefunded) {
                            if (draft.refundItemsPayload?.items.length) {
                                draft.refundItemsPayload.items =
                                    draft.refundItemsPayload.items.filter(
                                        (
                                            item: BigCommerceRefundItemsPayloadComponent
                                        ) =>
                                            !(
                                                item.item_id ===
                                                    parseFloat(
                                                        refundedShippingId
                                                    ) &&
                                                item.item_type ===
                                                    BigCommerceRefundableItemType.handling
                                            )
                                    )
                            }
                        } else {
                            if (refundData.available_amount > 0) {
                                draft.refundItemsPayload?.items.push({
                                    item_type:
                                        BigCommerceRefundableItemType.handling,
                                    item_id: parseFloat(refundedShippingId),
                                    amount: formatPrice(
                                        refundData.available_amount
                                    ),
                                })
                            }
                        }
                    }
                )
                return draft
            })
        }
        default:
            throw new Error()
    }
}
