import React from 'react'
import classnames from 'classnames'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import {
    BigCommerceAvailablePaymentOptionsData,
    BigCommerceRefundMethod,
    BigCommerceRefundType,
} from 'models/integration/types'
import css from '../RefundOrderModal.less'
import {buildPaymentOptionLabel} from '../utils'

type Props = {
    availablePaymentOptionsData: Maybe<BigCommerceAvailablePaymentOptionsData>
    selectedPaymentOption: Maybe<BigCommerceRefundMethod>
    setSelectedPaymentOption: (
        selectedPaymentOption: Maybe<BigCommerceRefundMethod>
    ) => void
    refundType: BigCommerceRefundType
    isLoading: boolean
    currencyCode: Maybe<string>
}

export function RefundMethodPickerSection({
    availablePaymentOptionsData,
    selectedPaymentOption,
    setSelectedPaymentOption,
    refundType,
    isLoading,
    currencyCode,
}: Props) {
    return (
        <div className={css.modalSection}>
            <p className={css.modalSectionHeader}>Refund method</p>
            {!availablePaymentOptionsData && (
                <p className={classnames({[css.disabled]: isLoading})}>
                    {refundType === BigCommerceRefundType.CustomAmount
                        ? 'Select an amount to refund.'
                        : 'Select items to refund.'}
                </p>
            )}
            {availablePaymentOptionsData &&
                !availablePaymentOptionsData.refund_methods.length && (
                    <p className={classnames({[css.disabled]: isLoading})}>
                        No refund method available.
                    </p>
                )}
            {availablePaymentOptionsData &&
                availablePaymentOptionsData.refund_methods.length &&
                availablePaymentOptionsData.refund_methods.map(
                    (paymentOption, index) => {
                        const optionLabel = buildPaymentOptionLabel(
                            paymentOption,
                            currencyCode
                        )
                        return (
                            <PreviewRadioButton
                                role="checkbox"
                                className={css.previewRadioButtonWrapper}
                                isDisabled={isLoading}
                                key={`option-${index}`}
                                value={`option-${index}`}
                                label={optionLabel}
                                isSelected={
                                    selectedPaymentOption === paymentOption
                                }
                                onClick={() => {
                                    setSelectedPaymentOption(paymentOption)
                                }}
                            />
                        )
                    }
                )}
        </div>
    )
}
