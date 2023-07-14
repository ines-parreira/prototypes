import React, {Dispatch} from 'react'
import {Table} from 'reactstrap'

import {
    BigCommerceAvailablePaymentOptionsData,
    BigCommerceRefundItemsPayload,
    GiftWrappingItemRefundData,
    HandlingItemRefundData,
    OrderLevelRefundData,
    ProductItemRefundData,
    ShippingItemRefundData,
} from 'models/integration/types'
import bigcommerceLineItemRowCss from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/AddOrderModal/components/order-table/OrderLineItemRow.less'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import Spinner from 'pages/common/components/Spinner'
import {
    calculateOrderSubtotal,
    calculateOrderTotal,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/RefundOrderModal/utils'
import {
    BIGCOMMERCE_REFUND_ACTION_TYPE,
    BigCommerceRefundActionType,
} from '../../reducer'
import bigcommerceTableCss from './OrderTable.less'
import {RefundableAmountComponent} from './RefundableAmountComponent'

type Props = {
    orderLevelRefundData: OrderLevelRefundData
    refundItemsPayload: Maybe<BigCommerceRefundItemsPayload>
    dispatchRefundOrderState: Dispatch<BIGCOMMERCE_REFUND_ACTION_TYPE>
    availablePaymentOptionsData: Maybe<BigCommerceAvailablePaymentOptionsData>
    productRefundData: Record<string, ProductItemRefundData>
    giftWrappingRefundData: Record<string, GiftWrappingItemRefundData>
    shippingRefundData: Record<string, ShippingItemRefundData>
    handlingRefundData: Record<string, HandlingItemRefundData>
    shippingCostBaseTotal: number
    shippingCostPaidTotal: number
    availableShippingCostTotal: number
    refundedShippingCostTotal: number
    isShippingCostRefunded: boolean
    setIsShippingCostRefunded: (isShippingCostRefunded: boolean) => void
    initialHandlingFeeTotal: number
    availableHandlingFeeTotal: number
    refundedHandlingFeeTotal: number
    isHandlingFeeRefunded: boolean
    setIsHandlingFeeRefunded: (isHandlingFeeRefunded: boolean) => void
    currencyCode: Maybe<string>
    isLoading: boolean
}

export function TotalsSummaryComponent({
    orderLevelRefundData,
    refundItemsPayload,
    dispatchRefundOrderState,
    availablePaymentOptionsData,
    productRefundData,
    giftWrappingRefundData,
    shippingRefundData,
    handlingRefundData,
    shippingCostBaseTotal,
    shippingCostPaidTotal,
    availableShippingCostTotal,
    refundedShippingCostTotal,
    isShippingCostRefunded,
    setIsShippingCostRefunded,
    initialHandlingFeeTotal,
    availableHandlingFeeTotal,
    refundedHandlingFeeTotal,
    isHandlingFeeRefunded,
    setIsHandlingFeeRefunded,
    currencyCode,
    isLoading,
}: Props) {
    return (
        <>
            <Table hover className={bigcommerceTableCss.totalsTable}>
                <tbody>
                    <tr>
                        <td>
                            <span>Subtotal</span>
                        </td>
                        <td
                            className={bigcommerceLineItemRowCss.numberColSmall}
                            colSpan={3}
                        >
                            {isLoading ? (
                                <Spinner
                                    color="gloom"
                                    className={bigcommerceTableCss.spinner}
                                />
                            ) : (
                                <MoneyAmount
                                    renderIfZero
                                    amount={String(
                                        calculateOrderSubtotal(
                                            refundItemsPayload,
                                            productRefundData,
                                            giftWrappingRefundData,
                                            false
                                        )
                                    )}
                                    currencyCode={
                                        currencyCode ? currencyCode : null
                                    }
                                />
                            )}
                        </td>
                    </tr>
                    {!!Object.keys(shippingRefundData).length && (
                        <RefundableAmountComponent
                            costName={'Shipping'}
                            fullPrice={shippingCostBaseTotal}
                            discountedPrice={shippingCostPaidTotal}
                            initialAmount={shippingCostPaidTotal}
                            availableAmount={availableShippingCostTotal}
                            refundedAmount={refundedShippingCostTotal}
                            isAmountRefunded={isShippingCostRefunded}
                            setIsAmountRefunded={() => {
                                setIsShippingCostRefunded(
                                    !isShippingCostRefunded
                                )
                                dispatchRefundOrderState({
                                    type: BigCommerceRefundActionType.EntireOrderAddShipping,
                                    shippingRefundData: shippingRefundData,
                                    isShippingCostRefunded:
                                        !isShippingCostRefunded,
                                })
                            }}
                            currencyCode={currencyCode}
                            isLoading={isLoading}
                        />
                    )}
                    {!!Object.keys(handlingRefundData).length && (
                        <RefundableAmountComponent
                            costName={'Handling'}
                            initialAmount={initialHandlingFeeTotal}
                            availableAmount={availableHandlingFeeTotal}
                            refundedAmount={refundedHandlingFeeTotal}
                            isAmountRefunded={isHandlingFeeRefunded}
                            setIsAmountRefunded={() => {
                                setIsHandlingFeeRefunded(!isHandlingFeeRefunded)
                                dispatchRefundOrderState({
                                    type: BigCommerceRefundActionType.EntireOrderAddHandling,
                                    handlingRefundData: handlingRefundData,
                                    isHandlingFeeRefunded:
                                        !isHandlingFeeRefunded,
                                })
                            }}
                            currencyCode={currencyCode}
                            isLoading={isLoading}
                        />
                    )}
                    <tr>
                        <td>
                            <span>Taxes</span>
                        </td>
                        <td
                            className={bigcommerceLineItemRowCss.numberColSmall}
                            colSpan={3}
                        >
                            {isLoading ? (
                                <Spinner
                                    color="gloom"
                                    className={bigcommerceTableCss.spinner}
                                />
                            ) : (
                                <MoneyAmount
                                    renderIfZero
                                    amount={String(
                                        availablePaymentOptionsData?.total_refund_tax_amount
                                    )}
                                    currencyCode={
                                        currencyCode ? currencyCode : null
                                    }
                                />
                            )}
                        </td>
                    </tr>
                </tbody>
            </Table>
            <Table hover className={bigcommerceTableCss.totalsTable}>
                <tbody>
                    <tr>
                        <td>
                            <span>Refund total</span>
                        </td>
                        <td
                            className={bigcommerceLineItemRowCss.numberColSmall}
                            colSpan={3}
                        >
                            {isLoading ? (
                                <Spinner
                                    color="gloom"
                                    className={bigcommerceTableCss.spinner}
                                />
                            ) : (
                                <MoneyAmount
                                    renderIfZero
                                    amount={String(
                                        calculateOrderTotal(
                                            refundItemsPayload,
                                            productRefundData,
                                            giftWrappingRefundData,
                                            availablePaymentOptionsData
                                        )
                                    )}
                                    currencyCode={
                                        currencyCode ? currencyCode : null
                                    }
                                />
                            )}
                        </td>
                    </tr>

                    {!!orderLevelRefundData.refunded_amount && (
                        <tr>
                            <td>
                                <span>Previously refunded</span>
                            </td>
                            <td
                                className={
                                    bigcommerceLineItemRowCss.numberColSmall
                                }
                                colSpan={3}
                            >
                                {isLoading ? (
                                    <Spinner
                                        color="gloom"
                                        className={bigcommerceTableCss.spinner}
                                    />
                                ) : (
                                    <MoneyAmount
                                        renderIfZero
                                        amount={String(
                                            orderLevelRefundData.refunded_amount
                                        )}
                                        currencyCode={
                                            currencyCode ? currencyCode : null
                                        }
                                    />
                                )}
                            </td>
                        </tr>
                    )}
                    <tr className={bigcommerceTableCss.noBorder}>
                        <td>
                            <span>Available for refund</span>
                        </td>
                        <td
                            className={bigcommerceLineItemRowCss.numberColSmall}
                            colSpan={3}
                        >
                            {isLoading ? (
                                <Spinner
                                    color="gloom"
                                    className={bigcommerceTableCss.spinner}
                                />
                            ) : (
                                <MoneyAmount
                                    renderIfZero
                                    amount={String(
                                        orderLevelRefundData.available_amount
                                    )}
                                    currencyCode={
                                        currencyCode ? currencyCode : null
                                    }
                                />
                            )}
                        </td>
                    </tr>
                </tbody>
            </Table>
        </>
    )
}
