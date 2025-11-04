import React, { Dispatch, useRef, useState } from 'react'

import { useDebouncedEffect } from '@repo/hooks'
import classNames from 'classnames'

import { LegacyButton as Button, LegacyLabel as Label } from '@gorgias/axiom'

import { OrderStatusList } from 'models/integration/types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownFooter from 'pages/common/components/dropdown/DropdownFooter'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import TextArea from 'pages/common/forms/TextArea'

import {
    BIGCOMMERCE_REFUND_ACTION_TYPE,
    BigCommerceRefundActionType,
} from '../types'

import cssRefundOrderModal from '../RefundOrderModal.less'
import css from './RefundOrderFooter.less'

type Props = {
    newOrderStatus: Maybe<string>
    dispatchRefundOrderState: Dispatch<BIGCOMMERCE_REFUND_ACTION_TYPE>
    isLoading: boolean
}

export function RefundOrderFooter({
    newOrderStatus,
    dispatchRefundOrderState,
    isLoading,
}: Props) {
    const [reasonForRefund, setReasonForRefund] = useState('')
    const maxLengthRefundReason = 1000

    const selectRef = useRef(null)
    const floatingSelectRef = useRef(null)
    const [isSelectOpen, setIsSelectOpen] = useState(false)

    useDebouncedEffect(
        () => {
            dispatchRefundOrderState({
                type: BigCommerceRefundActionType.SetRefundReason,
                refundReason: reasonForRefund,
            })
        },
        [reasonForRefund],
        300,
    )

    return (
        <div className={cssRefundOrderModal.modalSectionSmall}>
            <p className={cssRefundOrderModal.modalSectionHeader}>Other</p>
            <Label className={cssRefundOrderModal.label} htmlFor="refundReason">
                Reason for refund
            </Label>
            <TextArea
                id="refundReason"
                className={cssRefundOrderModal.textAreaWrapper}
                rows={1}
                isDisabled={isLoading}
                maxLength={maxLengthRefundReason}
                value={reasonForRefund}
                onChange={(reason: string) => {
                    setReasonForRefund(reason)
                }}
                caption={`Maximum length is ${maxLengthRefundReason} characters.`}
                autoRowHeight
            />
            <Label
                className={classNames(
                    cssRefundOrderModal.label,
                    cssRefundOrderModal.smallSpacingMarginTop,
                )}
                htmlFor="newOrderStatus"
            >
                New status
            </Label>
            <SelectInputBox
                id="newOrderStatus"
                isDisabled={isLoading}
                ref={selectRef}
                floating={floatingSelectRef}
                onToggle={setIsSelectOpen}
                placeholder="Select order status"
                label={newOrderStatus}
            >
                <SelectInputBoxContext.Consumer>
                    {(context) => (
                        <Dropdown
                            target={selectRef}
                            ref={floatingSelectRef}
                            isOpen={isSelectOpen}
                            onToggle={() => context!.onBlur()}
                            placement="top"
                            contained
                            className={css.dropdownWrapper}
                        >
                            <DropdownBody>
                                {OrderStatusList.map((orderStatus) => (
                                    <DropdownItem
                                        className={css.dropdownItemWrapper}
                                        key={`order-status-${orderStatus}`}
                                        option={{
                                            label: orderStatus,
                                            value: orderStatus,
                                        }}
                                        onClick={() => {
                                            dispatchRefundOrderState({
                                                type: BigCommerceRefundActionType.SetNewOrderStatus,
                                                newOrderStatus: orderStatus,
                                            })
                                        }}
                                        shouldCloseOnSelect
                                    >
                                        <span className={css.choiceButton}>
                                            {orderStatus}
                                        </span>
                                        {newOrderStatus === orderStatus && (
                                            <span
                                                className={`material-icons ${css.checkIcon}`}
                                            >
                                                check
                                            </span>
                                        )}
                                    </DropdownItem>
                                ))}
                            </DropdownBody>
                            {newOrderStatus && (
                                <DropdownFooter>
                                    <Button
                                        fillStyle="ghost"
                                        onClick={() => {
                                            dispatchRefundOrderState({
                                                type: BigCommerceRefundActionType.SetNewOrderStatus,
                                                newOrderStatus: null,
                                            })
                                            context!.onBlur()
                                        }}
                                    >
                                        Clear Selection
                                    </Button>
                                </DropdownFooter>
                            )}
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
            <p className={cssRefundOrderModal.caption}>
                If the field is left empty, Refunded or Partially Refunded
                status will be assigned to order.
            </p>
        </div>
    )
}
