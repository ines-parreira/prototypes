import React, {Dispatch, useMemo, useState} from 'react'
import {Table} from 'reactstrap'

import {
    BigCommerceAvailablePaymentOptionsData,
    BigCommerceRefundableItemType,
    BigCommerceRefundItemsPayload,
    GiftWrappingItemRefundData,
    HandlingItemRefundData,
    OrderLevelRefundData,
    ProductItemRefundData,
    ShippingItemRefundData,
} from 'models/integration/types'
import {BIGCOMMERCE_REFUND_ACTION_TYPE} from '../../types'
import {OrderLineItemRow} from './OrderLineItemRow'
import {TotalsSummaryComponent} from './TotalsSummaryComponent'
import bigcommerceTableCss from './OrderTable.less'

type Props = {
    orderLevelRefundData: OrderLevelRefundData
    refundItemsPayload: Maybe<BigCommerceRefundItemsPayload>
    dispatchRefundOrderState: Dispatch<BIGCOMMERCE_REFUND_ACTION_TYPE>
    availablePaymentOptionsData: Maybe<BigCommerceAvailablePaymentOptionsData>
    productImageURLs: Record<string, Maybe<string>>
    productRefundData: Record<string, ProductItemRefundData>
    giftWrappingRefundData: Record<string, GiftWrappingItemRefundData>
    shippingRefundData: Record<string, ShippingItemRefundData>
    handlingRefundData: Record<string, HandlingItemRefundData>
    storeHash: string
    currencyCode: Maybe<string>
    isLoading: boolean
}

export default function OrderTable({
    orderLevelRefundData,
    refundItemsPayload,
    dispatchRefundOrderState,
    availablePaymentOptionsData,
    productImageURLs,
    productRefundData,
    giftWrappingRefundData,
    shippingRefundData,
    handlingRefundData,
    storeHash,
    currencyCode,
    isLoading,
}: Props) {
    const [
        shippingCostBaseTotal, // Cost before discounts
        shippingCostPaidTotal, //  Cost after discounts
        availableShippingCostTotal,
        refundedShippingCostTotal,
    ] = useMemo(() => {
        let shippingCostBaseTotal = 0
        let shippingCostPaidTotal = 0
        let availableShippingCostTotal = 0
        let refundedShippingCostTotal = 0

        Object.values(shippingRefundData).forEach(
            (refundData: ShippingItemRefundData) => {
                shippingCostBaseTotal += parseFloat(
                    refundData.shipping_data.base_cost
                )
                shippingCostPaidTotal += refundData.initial_amount

                availableShippingCostTotal += refundData.available_amount
                refundedShippingCostTotal += refundData.refunded_amount
            }
        )
        return [
            shippingCostBaseTotal,
            shippingCostPaidTotal,
            availableShippingCostTotal,
            refundedShippingCostTotal,
        ]
    }, [shippingRefundData])

    const [
        initialHandlingFeeTotal,
        availableHandlingFeeTotal,
        refundedHandlingFeeTotal,
    ] = useMemo(() => {
        let initialHandlingFeeTotal = 0
        let availableHandlingFeeTotal = 0
        let refundedHandlingFeeTotal = 0

        Object.values(handlingRefundData).forEach(
            (refundData: HandlingItemRefundData) => {
                initialHandlingFeeTotal += refundData.initial_amount
                availableHandlingFeeTotal += refundData.available_amount
                refundedHandlingFeeTotal += refundData.refunded_amount
            }
        )
        return [
            initialHandlingFeeTotal,
            availableHandlingFeeTotal,
            refundedHandlingFeeTotal,
        ]
    }, [handlingRefundData])

    const [isShippingCostRefunded, setIsShippingCostRefunded] = useState(
        availableShippingCostTotal <= 0
    )
    const [isHandlingFeeRefunded, setIsHandlingFeeRefunded] = useState(
        availableHandlingFeeTotal <= 0
    )

    return (
        <>
            <Table
                hover={!!Object.keys(productRefundData).length}
                className={bigcommerceTableCss.productsTable}
            >
                <thead>
                    <tr>
                        <th>Product</th>
                        <th className="text-right">Price</th>
                        <th>Qty</th>
                        <th className="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {!Object.keys(productRefundData).length && (
                        <tr>
                            <td colSpan={4} className="text-center text-muted">
                                <small>No items</small>
                            </td>
                        </tr>
                    )}
                    {Object.entries(productRefundData).map(
                        ([refundedProductId, refundData]: [
                            string,
                            ProductItemRefundData
                        ]) => {
                            return (
                                <OrderLineItemRow
                                    key={`${BigCommerceRefundableItemType.product}-${refundedProductId}`}
                                    productImage={
                                        productImageURLs[refundedProductId]
                                    }
                                    productData={refundData}
                                    giftWrappingData={
                                        giftWrappingRefundData[
                                            refundedProductId
                                        ]
                                    }
                                    storeHash={storeHash}
                                    currencyCode={currencyCode}
                                />
                            )
                        }
                    )}
                </tbody>
            </Table>
            <TotalsSummaryComponent
                orderLevelRefundData={orderLevelRefundData}
                refundItemsPayload={refundItemsPayload}
                dispatchRefundOrderState={dispatchRefundOrderState}
                availablePaymentOptionsData={availablePaymentOptionsData}
                productRefundData={productRefundData}
                giftWrappingRefundData={giftWrappingRefundData}
                shippingRefundData={shippingRefundData}
                handlingRefundData={handlingRefundData}
                shippingCostBaseTotal={shippingCostBaseTotal}
                shippingCostPaidTotal={shippingCostPaidTotal}
                availableShippingCostTotal={availableShippingCostTotal}
                refundedShippingCostTotal={refundedShippingCostTotal}
                isShippingCostRefunded={isShippingCostRefunded}
                setIsShippingCostRefunded={setIsShippingCostRefunded}
                initialHandlingFeeTotal={initialHandlingFeeTotal}
                availableHandlingFeeTotal={availableHandlingFeeTotal}
                refundedHandlingFeeTotal={refundedHandlingFeeTotal}
                isHandlingFeeRefunded={isHandlingFeeRefunded}
                setIsHandlingFeeRefunded={setIsHandlingFeeRefunded}
                currencyCode={currencyCode}
                isLoading={isLoading}
            />
        </>
    )
}
