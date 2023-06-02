import React, {useState} from 'react'
import classnames from 'classnames'
import {useDebounce} from 'react-use'
import {
    BigCommerceRefundableItemType,
    BigCommerceRefundItemsPayload,
    BigCommerceRefundMethod,
    CalculateOrderRefundDataResponse,
} from 'models/integration/types'
import getShopifyMoneySymbol from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/shared/helpers'
import NumberInput from 'pages/common/forms/input/NumberInput'
import cssRefundOrderModal from '../RefundOrderModal.less'
import {formatAmount} from '../utils'
import css from './CustomAmountRefundOrderModal.less'

type Props = {
    refundData: CalculateOrderRefundDataResponse
    refundItemsPayload: Maybe<BigCommerceRefundItemsPayload>
    setRefundItemsPayload: (
        refundItemsPayload: Maybe<BigCommerceRefundItemsPayload>
    ) => void
    setSelectedPaymentOption: (
        selectedPaymentOption: Maybe<BigCommerceRefundMethod>
    ) => void
    currencyCode: Maybe<string>
    isLoading: boolean
    hasError: boolean
}

export function CustomAmountRefundOrderModal({
    refundData,
    refundItemsPayload,
    setRefundItemsPayload,
    setSelectedPaymentOption,
    currencyCode,
    isLoading,
    hasError,
}: Props) {
    const [amountToRefund, setAmountToRefund] = useState(0)

    const availableAmount =
        refundData?.order_level_refund_data?.available_amount || 0
    const currencySymbol = getShopifyMoneySymbol(currencyCode || 'USD', true)
    const amountToRefundCaption = `Available for refund: ${formatAmount(
        currencyCode,
        availableAmount
    )}`
    const [isFirstRender, setIsFirstRender] = useState(true)

    const checkAmountToRefundValidity = () => {
        return (
            !isNaN(amountToRefund) &&
            amountToRefund >= 0 &&
            amountToRefund <= availableAmount
        )
    }

    const handleOnClick = (event: React.FormEvent<HTMLInputElement>) => {
        event.currentTarget.select()
    }

    const handleOnSubmitAmountToRefund = () => {
        if (
            amountToRefund > 0 &&
            checkAmountToRefundValidity() &&
            refundData.order
        ) {
            if (
                refundItemsPayload?.items?.length &&
                refundItemsPayload.items[0]?.amount === amountToRefund
            ) {
                // The amount is identical
                return
            }

            setRefundItemsPayload({
                items: [
                    {
                        item_type: BigCommerceRefundableItemType.order,
                        item_id: refundData.order.id,
                        amount: amountToRefund,
                    },
                ],
            })
        } else {
            // Invalid amount
            setRefundItemsPayload({items: []})
            setSelectedPaymentOption(null)
        }
    }

    useDebounce(
        () => {
            if (!isFirstRender) {
                handleOnSubmitAmountToRefund()
            } else {
                setIsFirstRender(false)
            }
        },
        1000,
        [amountToRefund]
    )

    return (
        <div className={cssRefundOrderModal.modalSection}>
            <p className={cssRefundOrderModal.modalSectionHeader}>Refund</p>
            <NumberInput
                className={classnames(css.customAmountRefundInputFieldWrapper, {
                    [cssRefundOrderModal.disabled]: isLoading,
                })}
                isRequired
                isDisabled={isLoading}
                prefix={currencySymbol}
                suffix={' '}
                min={0}
                step={0.01}
                hasError={!checkAmountToRefundValidity() || hasError}
                value={amountToRefund}
                onChange={(amount) => {
                    setAmountToRefund(amount || 0)
                }}
                onClick={handleOnClick}
                onFocus={handleOnClick}
                hasControls={false}
            />
            <p
                className={classnames(cssRefundOrderModal.caption, {
                    [cssRefundOrderModal.hasError]:
                        !checkAmountToRefundValidity() || hasError,
                })}
            >
                {!checkAmountToRefundValidity() ||
                hasError ||
                (currencyCode && availableAmount > 0)
                    ? amountToRefundCaption
                    : ''}
            </p>
        </div>
    )
}
