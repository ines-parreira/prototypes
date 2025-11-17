import type { Dispatch } from 'react'
import React, { useEffect } from 'react'

import { LoadingSpinner } from '@gorgias/axiom'

import type {
    BigCommerceAvailablePaymentOptionsData,
    BigCommerceRefundItemsPayload,
    CalculateOrderRefundDataResponse,
} from 'models/integration/types'

import type { BIGCOMMERCE_REFUND_ACTION_TYPE } from '../types'
import { BigCommerceRefundActionType } from '../types'
import OrderTable from './order-table/OrderTable'

import cssRefundOrderModal from '../RefundOrderModal.less'
import css from './EntireOrderRefundOrderModal.less'

type Props = {
    refundData: CalculateOrderRefundDataResponse
    refundItemsPayload: Maybe<BigCommerceRefundItemsPayload>
    availablePaymentOptionsData: Maybe<BigCommerceAvailablePaymentOptionsData>
    productImageURLs: Record<string, Maybe<string>>
    dispatchRefundOrderState: Dispatch<BIGCOMMERCE_REFUND_ACTION_TYPE>
    storeHash: string
    currencyCode: Maybe<string>
    isLoading: boolean
}

export function EntireOrderRefundOrderModal({
    refundData,
    refundItemsPayload,
    availablePaymentOptionsData,
    productImageURLs,
    dispatchRefundOrderState,
    storeHash,
    currencyCode,
    isLoading,
}: Props) {
    const productRefundData =
        refundData.individual_items_level_refund_data?.PRODUCT
    const giftWrappingRefundData =
        refundData.individual_items_level_refund_data?.GIFT_WRAPPING
    const shippingRefundData =
        refundData.individual_items_level_refund_data?.SHIPPING
    const handlingRefundData =
        refundData.individual_items_level_refund_data?.HANDLING

    useEffect(() => {
        dispatchRefundOrderState({
            type: BigCommerceRefundActionType.ResetRefundMethodState,
        })
        dispatchRefundOrderState({
            type: BigCommerceRefundActionType.EntireOrder,
            refundData: refundData,
        })
    }, [refundData, dispatchRefundOrderState])

    return (
        <div className={cssRefundOrderModal.modalSection}>
            <p className={cssRefundOrderModal.modalSectionHeader}>
                Refundable items
            </p>
            {isLoading && !productRefundData && (
                <LoadingSpinner className={css.spinner} />
            )}
            {currencyCode &&
                refundData?.order_level_refund_data &&
                productRefundData &&
                giftWrappingRefundData &&
                shippingRefundData &&
                handlingRefundData && (
                    <OrderTable
                        orderLevelRefundData={
                            refundData.order_level_refund_data
                        }
                        refundItemsPayload={refundItemsPayload}
                        dispatchRefundOrderState={dispatchRefundOrderState}
                        availablePaymentOptionsData={
                            availablePaymentOptionsData
                        }
                        productImageURLs={productImageURLs}
                        productRefundData={productRefundData}
                        giftWrappingRefundData={giftWrappingRefundData}
                        shippingRefundData={shippingRefundData}
                        handlingRefundData={handlingRefundData}
                        storeHash={storeHash}
                        currencyCode={currencyCode}
                        isLoading={isLoading}
                    />
                )}
        </div>
    )
}
