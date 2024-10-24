import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, {ComponentProps} from 'react'

import {bigCommerceAvailablePaymentOptionsDataResponseFixture} from 'fixtures/bigcommerce'
import {BigCommerceRefundType} from 'models/integration/types'

import {defaultBigCommerceRefundType} from '../../consts'
import {BigCommerceRefundActionType} from '../../types'
import {RefundMethodPickerSection} from '../RefundMethodPickerSection'

type Props = ComponentProps<typeof RefundMethodPickerSection>

const initialDisabledProps: Props = {
    availablePaymentOptionsData: null,
    selectedPaymentOption: null,
    dispatchRefundOrderState: jest.fn(),
    refundType: defaultBigCommerceRefundType,
    isLoading: true,
    currencyCode: null,
}

const initialProps: Props = {
    availablePaymentOptionsData: null,
    selectedPaymentOption: null,
    dispatchRefundOrderState: jest.fn(),
    refundType: BigCommerceRefundType.EntireOrder,
    isLoading: false,
    currencyCode: 'EUR',
}

const refundMethodsProps: Props = {
    availablePaymentOptionsData:
        bigCommerceAvailablePaymentOptionsDataResponseFixture,
    selectedPaymentOption: null,
    dispatchRefundOrderState: jest.fn(),
    refundType: BigCommerceRefundType.ManualAmount,
    isLoading: false,
    currencyCode: 'EUR',
}

describe('RefundMethodPickerSection', () => {
    it('snapshot renders the initial disabled state', () => {
        const {container} = render(
            <RefundMethodPickerSection {...initialDisabledProps} />
        )

        expect(container).toMatchSnapshot()
    })

    it('snapshot renders the initial state', () => {
        const {container} = render(
            <RefundMethodPickerSection {...initialProps} />
        )

        expect(container).toMatchSnapshot()
    })

    it('snapshot renders refund methods & selected refund method', () => {
        const {container} = render(
            <RefundMethodPickerSection
                {...refundMethodsProps}
                selectedPaymentOption={
                    bigCommerceAvailablePaymentOptionsDataResponseFixture
                        .refund_methods[1]
                }
            />
        )

        expect(container).toMatchSnapshot()
    })

    it('should test updating the selected refund method', () => {
        const dispatchRefundOrderStateMock = jest.fn()

        render(
            <RefundMethodPickerSection
                {...refundMethodsProps}
                dispatchRefundOrderState={dispatchRefundOrderStateMock}
            />
        )

        // Select second option
        userEvent.click(screen.getAllByRole('checkbox')[1])

        expect(dispatchRefundOrderStateMock).toHaveBeenCalledTimes(1)
        expect(dispatchRefundOrderStateMock).toHaveBeenCalledWith({
            type: BigCommerceRefundActionType.SetSelectedPaymentOption,
            selectedPaymentOption:
                bigCommerceAvailablePaymentOptionsDataResponseFixture
                    .refund_methods[1],
        })
    })
})
