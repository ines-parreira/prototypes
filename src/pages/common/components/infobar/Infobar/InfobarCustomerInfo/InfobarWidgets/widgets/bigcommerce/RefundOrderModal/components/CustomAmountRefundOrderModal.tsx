import React, {useState} from 'react'
import classnames from 'classnames'
import {
    BigCommerceRefundableItemType,
    BigCommerceRefundItemsPayload,
    CalculateOrderRefundDataResponse,
} from 'models/integration/types'
import getShopifyMoneySymbol from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/shared/helpers'
import NumberInput from 'pages/common/forms/input/NumberInput'
import cssRefundOrderModal from '../RefundOrderModal.less'
import {formatAmount} from '../utils'
import css from './CustomAmountRefundOrderModal.less'

type Props = {
    refundData: CalculateOrderRefundDataResponse
    setTotalAmountToRefund: (totalAmountToRefund: number) => void
    setRefundItemsPayload: (
        refundItemsPayload: Maybe<BigCommerceRefundItemsPayload>
    ) => void
    currencyCode: Maybe<string>
    isLoading: boolean
    hasError: boolean
}

export function CustomAmountRefundOrderModal({
    refundData,
    setTotalAmountToRefund,
    setRefundItemsPayload,
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
        if (checkAmountToRefundValidity() && refundData.order) {
            setRefundItemsPayload({
                items: [
                    {
                        item_type: BigCommerceRefundableItemType.order,
                        item_id: refundData.order.id,
                        amount: amountToRefund,
                    },
                ],
            })
            setTotalAmountToRefund(amountToRefund)
        } else {
            setRefundItemsPayload({items: []})
            setTotalAmountToRefund(0)
        }
    }

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
                onBlur={handleOnSubmitAmountToRefund}
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
