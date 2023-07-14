import React, {Dispatch} from 'react'
import classnames from 'classnames'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import Spinner from 'pages/common/components/Spinner'
import {
    BigCommerceAvailablePaymentOptionsData,
    BigCommerceRefundMethod,
    BigCommerceRefundType,
} from 'models/integration/types'
import css from '../RefundOrderModal.less'
import {buildPaymentOptionLabel} from '../utils'
import {
    BIGCOMMERCE_REFUND_ACTION_TYPE,
    BigCommerceRefundActionType,
} from '../reducer'

type Props = {
    availablePaymentOptionsData: Maybe<BigCommerceAvailablePaymentOptionsData>
    selectedPaymentOption: Maybe<BigCommerceRefundMethod>
    dispatchRefundOrderState: Dispatch<BIGCOMMERCE_REFUND_ACTION_TYPE>
    refundType: BigCommerceRefundType
    isLoading: boolean
    currencyCode: Maybe<string>
}

export function RefundMethodPickerSection({
    availablePaymentOptionsData,
    selectedPaymentOption,
    dispatchRefundOrderState,
    refundType,
    isLoading,
    currencyCode,
}: Props) {
    return (
        <div className={css.modalSection}>
            <p className={css.modalSectionHeader}>Refund method</p>
            {isLoading && (
                <div className={css.spinnerWrapper}>
                    <Spinner color="gloom" className={css.spinner} />
                </div>
            )}
            {!availablePaymentOptionsData && (
                <p className={classnames({[css.disabled]: isLoading})}>
                    {refundType === BigCommerceRefundType.ManualAmount
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
                                    dispatchRefundOrderState({
                                        type: BigCommerceRefundActionType.SetSelectedPaymentOption,
                                        selectedPaymentOption: paymentOption,
                                    })
                                }}
                            />
                        )
                    }
                )}
        </div>
    )
}
