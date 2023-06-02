import React, {ComponentProps} from 'react'
import {act, fireEvent, render, screen} from '@testing-library/react'
import {
    BigCommerceOrder,
    BigCommerceRefundableItemType,
} from 'models/integration/types'
import {CustomAmountRefundOrderModal} from '../CustomAmountRefundOrderModal'

type Props = ComponentProps<typeof CustomAmountRefundOrderModal>

const bigcommerceOrder: BigCommerceOrder = {
    id: 123,
    currency_code: 'EUR',
}

const initialDisabledProps: Props = {
    refundData: {
        order: null,
        order_level_refund_data: null,
    },
    refundItemsPayload: null,
    setRefundItemsPayload: jest.fn(),
    setSelectedPaymentOption: jest.fn(),
    currencyCode: null,
    isLoading: true,
    hasError: false,
}

const availableAmount = 1230000.89

const initialProps: Props = {
    refundData: {
        order: bigcommerceOrder,
        order_level_refund_data: {
            total_amount: 1234567.89,
            refunded_amount: 4567,
            available_amount: availableAmount,
        },
    },
    refundItemsPayload: null,
    setRefundItemsPayload: jest.fn(),
    setSelectedPaymentOption: jest.fn(),
    currencyCode: 'EUR',
    isLoading: false,
    hasError: false,
}

const zeroAmountToRefundProps: Props = {
    refundData: {
        order: bigcommerceOrder,
        order_level_refund_data: {
            total_amount: 1234567.89,
            refunded_amount: 1234567.89,
            available_amount: 0,
        },
    },
    refundItemsPayload: null,
    setRefundItemsPayload: jest.fn(),
    setSelectedPaymentOption: jest.fn(),
    currencyCode: 'EUR',
    isLoading: false,
    hasError: false,
}

jest.useFakeTimers()

describe('CustomAmountRefundOrderModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('snapshot renders the initial disabled state', () => {
        const {container} = render(
            <CustomAmountRefundOrderModal {...initialDisabledProps} />
        )

        expect(container).toMatchSnapshot()
    })

    it('snapshot renders the initial state', () => {
        const {container} = render(
            <CustomAmountRefundOrderModal {...initialProps} />
        )

        expect(container).toMatchSnapshot()
    })

    it("should update external state with user's data when the agent's input is valid", () => {
        const amountToRefund = 4000

        const setRefundItemsPayloadMock = jest.fn()
        const setSelectedPaymentOptionMock = jest.fn()

        render(
            <CustomAmountRefundOrderModal
                {...initialProps}
                setRefundItemsPayload={setRefundItemsPayloadMock}
                setSelectedPaymentOption={setSelectedPaymentOptionMock}
            />
        )
        act(() => jest.runAllTimers())

        // Agent types an amount to refund => it will trigger a hook call with user's data
        fireEvent.change(screen.getByRole('spinbutton'), {
            target: {value: amountToRefund},
        })
        act(() => jest.runAllTimers())

        expect(setRefundItemsPayloadMock).toHaveBeenCalledTimes(1)
        expect(setRefundItemsPayloadMock).toHaveBeenCalledWith({
            items: [
                {
                    amount: amountToRefund,
                    item_id: bigcommerceOrder.id,
                    item_type: BigCommerceRefundableItemType.order,
                },
            ],
        })
        expect(setSelectedPaymentOptionMock).toHaveBeenCalledTimes(0)
    })

    it("should update external state with raw data when the agent's input is not valid, but numerical", () => {
        const amountToRefund = availableAmount + 1

        const setRefundItemsPayloadMock = jest.fn()
        const setSelectedPaymentOptionMock = jest.fn()

        render(
            <CustomAmountRefundOrderModal
                {...initialProps}
                setRefundItemsPayload={setRefundItemsPayloadMock}
                setSelectedPaymentOption={setSelectedPaymentOptionMock}
            />
        )
        act(() => jest.runAllTimers())

        // Agent types an invalid numerical amount to refund => it will trigger a hook call with raw data
        fireEvent.change(screen.getByRole('spinbutton'), {
            target: {value: amountToRefund},
        })
        act(() => jest.runAllTimers())

        expect(setRefundItemsPayloadMock).toHaveBeenCalledTimes(1)
        expect(setRefundItemsPayloadMock).toHaveBeenCalledWith({items: []})
        expect(setSelectedPaymentOptionMock).toHaveBeenCalledTimes(1)
        expect(setSelectedPaymentOptionMock).toHaveBeenCalledWith(null)
    })

    it('should test behavior when the order is fully refunded - zero available amount left for refund', () => {
        const amountToRefund = 1

        const setRefundItemsPayloadMock = jest.fn()
        const setSelectedPaymentOptionMock = jest.fn()

        const {container} = render(
            <CustomAmountRefundOrderModal
                {...zeroAmountToRefundProps}
                setRefundItemsPayload={setRefundItemsPayloadMock}
                setSelectedPaymentOption={setSelectedPaymentOptionMock}
            />
        )

        expect(container).toMatchSnapshot()

        act(() => jest.runAllTimers())

        // Agent types an invalid numerical amount to refund => it will trigger a hook call with raw data
        fireEvent.change(screen.getByRole('spinbutton'), {
            target: {value: amountToRefund},
        })
        act(() => jest.runAllTimers())

        expect(setRefundItemsPayloadMock).toHaveBeenCalledTimes(1)
        expect(setRefundItemsPayloadMock).toHaveBeenCalledWith({items: []})
        expect(setSelectedPaymentOptionMock).toHaveBeenCalledTimes(1)
        expect(setSelectedPaymentOptionMock).toHaveBeenCalledWith(null)
        expect(container).toMatchSnapshot()
    })
})
