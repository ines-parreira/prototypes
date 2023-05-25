import _debounce from 'lodash/debounce'
import {Map as ImmutableMap} from 'immutable'
import {
    BigCommerceGeneralError,
    BigCommerceGeneralErrorMessage,
    BigCommerceRefundItemsPayload,
    BigCommerceRefundType,
    CalculateOrderRefundDataResponse,
} from 'models/integration/types'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {getBigCommerceOrderRefundData} from 'models/integration/resources/bigcommerce'
import {defaultBigCommerceRefundType} from './consts'

export const onReset = _debounce(
    ({
        setRefundType,
        setRefundData,
        setTotalAmountToRefund,
        setRefundItemsPayload,
        setRefundReason,
        setOrderIsCancelled,
    }: {
        setRefundType: (refundType: BigCommerceRefundType) => void
        setRefundData: (refundData: CalculateOrderRefundDataResponse) => void
        setTotalAmountToRefund: (totalAmountToRefund: number) => void
        setRefundItemsPayload: (
            refundItemsPayload: Maybe<BigCommerceRefundItemsPayload>
        ) => void
        setRefundReason: (refundReason: string) => void
        setOrderIsCancelled: (orderIsCancelled: boolean) => void
    }) => {
        setRefundType(defaultBigCommerceRefundType)
        setRefundData({
            order: null,
            order_level_refund_data: null,
        })
        setTotalAmountToRefund(0)
        setRefundItemsPayload(null)
        setRefundReason('')
        setOrderIsCancelled(false)

        logEvent(SegmentEvent.BigCommerceRefundOrderResetModal)
    },
    250
)

/**
 * Calculate refund of given order & initialize the modal.
 * */
export const calculateOrderRefund = async ({
    integrationId,
    customerId,
    orderId,
    setRefundData,
    setIsLoading,
    setErrorMessage,
}: {
    integrationId: number
    customerId: number
    orderId: number
    setRefundData: (refundData: CalculateOrderRefundDataResponse) => void
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

        setRefundData(data)

        logEvent(SegmentEvent.BigCommerceRefundOrderOpen)
    } catch (error) {
        // Error Handling
        setErrorMessage(
            error instanceof BigCommerceGeneralError
                ? error.message
                : BigCommerceGeneralErrorMessage.defaultError
        )
    } finally {
        setIsLoading(false)
    }
}

/**
 * Calculate the total order amount.
 * */
export function calculateTotalOrderAmount(
    order: ImmutableMap<any, any>
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
    return (
        calculateTotalOrderAmount(order) ===
        parseFloat(order.get('refunded_amount'))
    )
}

export function formatAmount(
    currencyCode: Maybe<string>,
    availableAmount: number
): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode || 'USD',
        currencyDisplay: 'symbol',
        maximumFractionDigits: 2,
    }).format(availableAmount)
}
