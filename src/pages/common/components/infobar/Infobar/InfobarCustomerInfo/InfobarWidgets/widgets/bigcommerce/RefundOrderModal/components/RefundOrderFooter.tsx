import React, {useState} from 'react'
import CheckBox from 'pages/common/forms/CheckBox'
import TextArea from 'pages/common/forms/TextArea'
import Label from 'pages/common/forms/Label/Label'
import css from '../RefundOrderModal.less'

type Props = {
    setRefundReason: (refundReason: string) => void
    orderIsCancelled: boolean
    setOrderIsCancelled: (orderIsCancelled: boolean) => void
    isLoading: boolean
}

export function RefundOrderFooter({
    setRefundReason,
    orderIsCancelled,
    setOrderIsCancelled,
    isLoading,
}: Props) {
    const [reasonForRefund, setReasonForRefund] = useState('')
    const maxLengthRefundReason = 1000

    const handleRefundReason = () => {
        setRefundReason(reasonForRefund)
    }

    return (
        <div className={css.modalSectionSmall}>
            <p className={css.modalSectionHeader}>Other</p>
            <Label className={css.label} htmlFor="refundReason">
                Reason for refund
            </Label>
            <TextArea
                id="refundReason"
                rows={1}
                isDisabled={isLoading}
                maxLength={maxLengthRefundReason}
                value={reasonForRefund}
                onChange={(reason: string) => {
                    setReasonForRefund(reason)
                }}
                onBlurCapture={handleRefundReason}
                caption={`Maximum length is ${maxLengthRefundReason} characters.`}
            />
            <CheckBox
                className={css.checkboxWrapper}
                isDisabled={isLoading}
                isChecked={orderIsCancelled}
                onChange={(orderIsCancelled: boolean) => {
                    setOrderIsCancelled(orderIsCancelled)
                }}
            >
                Mark order as Cancelled in BigCommerce
            </CheckBox>
        </div>
    )
}
