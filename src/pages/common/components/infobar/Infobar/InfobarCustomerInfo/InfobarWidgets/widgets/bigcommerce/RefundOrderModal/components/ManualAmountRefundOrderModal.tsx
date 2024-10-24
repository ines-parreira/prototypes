import classnames from 'classnames'
import React, {Dispatch, useEffect, useState} from 'react'

import useDebouncedEffect from 'hooks/useDebouncedEffect'
import {
    BigCommerceRefundableItemType,
    CalculateOrderRefundDataResponse,
    BigCommerceRefundItemsPayload,
} from 'models/integration/types'
import NumberInput from 'pages/common/forms/input/NumberInput'
import {getMoneySymbol} from 'utils/getMoneySymbol'

import cssRefundOrderModal from '../RefundOrderModal.less'
import {
    BIGCOMMERCE_REFUND_ACTION_TYPE,
    BigCommerceRefundActionType,
} from '../types'
import {formatAmount} from '../utils'
import css from './ManualAmountRefundOrderModal.less'

type Props = {
    refundData: CalculateOrderRefundDataResponse
    refundItemsPayload: Maybe<BigCommerceRefundItemsPayload>
    dispatchRefundOrderState: Dispatch<BIGCOMMERCE_REFUND_ACTION_TYPE>
    currencyCode: Maybe<string>
    isLoading: boolean
    hasError: boolean
}

export function ManualAmountRefundOrderModal({
    refundData,
    refundItemsPayload,
    dispatchRefundOrderState,
    currencyCode,
    isLoading,
    hasError,
}: Props) {
    const [amountToRefund, setAmountToRefund] = useState(0)

    const availableAmount =
        refundData?.order_level_refund_data?.available_amount || 0
    const currencySymbol = getMoneySymbol(currencyCode || 'USD', true)
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

            dispatchRefundOrderState({
                type: BigCommerceRefundActionType.ManualAmount,
                refundOrderItemPayload: {
                    item_type: BigCommerceRefundableItemType.order,
                    item_id: refundData.order.id,
                    amount: amountToRefund,
                },
            })
        } else {
            // Invalid amount
            dispatchRefundOrderState({
                type: BigCommerceRefundActionType.SetRefundItemsPayloadEmptyList,
            })
            dispatchRefundOrderState({
                type: BigCommerceRefundActionType.SetSelectedPaymentOption,
                selectedPaymentOption: null,
            })
        }
    }

    useEffect(() => {
        dispatchRefundOrderState({
            type: BigCommerceRefundActionType.ResetRefundMethodState,
        })
    }, [dispatchRefundOrderState])

    useDebouncedEffect(
        () => {
            if (!isFirstRender) {
                handleOnSubmitAmountToRefund()
            } else {
                setIsFirstRender(false)
            }
        },
        [amountToRefund],
        1000
    )

    return (
        <div className={cssRefundOrderModal.modalSection}>
            <p className={cssRefundOrderModal.modalSectionHeader}>Refund</p>
            <NumberInput
                className={classnames(css.manualAmountRefundInputFieldWrapper, {
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
