import React, {ComponentProps} from 'react'
import {act, fireEvent, render, screen} from '@testing-library/react'
import {
    BigCommerceOrder,
    BigCommerceRefundableItemType,
} from 'models/integration/types'
import {
    bigCommerceCalculateOrderRefundDataResponseApiFixture,
    bigCommerceOrderFixture,
} from 'fixtures/bigcommerce'
import {ManualAmountRefundOrderModal} from '../ManualAmountRefundOrderModal'
import {BigCommerceRefundActionType} from '../../reducer'

type Props = ComponentProps<typeof ManualAmountRefundOrderModal>

const bigcommerceOrder: BigCommerceOrder = {
    id: 123,
    currency_code: 'EUR',
    bc_products: bigCommerceOrderFixture.bc_products,
    bc_shipping: bigCommerceOrderFixture.bc_shipping,
}

const initialDisabledProps: Props = {
    refundData: {
        order: null,
        order_level_refund_data: null,
        individual_items_level_refund_data: null,
    },
    refundItemsPayload: null,
    dispatchRefundOrderState: jest.fn(),
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
        individual_items_level_refund_data:
            bigCommerceCalculateOrderRefundDataResponseApiFixture.individual_items_level_refund_data,
    },
    refundItemsPayload: null,
    dispatchRefundOrderState: jest.fn(),
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
        individual_items_level_refund_data:
            bigCommerceCalculateOrderRefundDataResponseApiFixture.individual_items_level_refund_data,
    },
    refundItemsPayload: null,
    dispatchRefundOrderState: jest.fn(),
    currencyCode: 'EUR',
    isLoading: false,
    hasError: false,
}

jest.useFakeTimers()

describe('ManualAmountRefundOrderModal', () => {
    it('snapshot renders the initial disabled state', () => {
        const {container} = render(
            <ManualAmountRefundOrderModal {...initialDisabledProps} />
        )

        expect(container).toMatchSnapshot()
    })

    it('snapshot renders the initial state', () => {
        const {container} = render(
            <ManualAmountRefundOrderModal {...initialProps} />
        )

        expect(container).toMatchSnapshot()
    })

    it("should update external state with user's data when the agent's input is valid", () => {
        const amountToRefund = 4000

        const dispatchRefundOrderStateMock = jest.fn()

        render(
            <ManualAmountRefundOrderModal
                {...initialProps}
                dispatchRefundOrderState={dispatchRefundOrderStateMock}
            />
        )
        act(() => jest.runAllTimers())

        // Agent types an amount to refund => it will trigger a hook call with user's data
        fireEvent.change(screen.getByRole('spinbutton'), {
            target: {value: amountToRefund},
        })
        act(() => jest.runAllTimers())

        expect(dispatchRefundOrderStateMock).toHaveBeenCalledTimes(2)
        // First call in `onResetRefundMethodData`
        expect(dispatchRefundOrderStateMock).toHaveBeenNthCalledWith(1, {
            type: BigCommerceRefundActionType.ResetRefundMethodState,
        })
        expect(dispatchRefundOrderStateMock).toHaveBeenNthCalledWith(2, {
            type: BigCommerceRefundActionType.ManualAmount,
            refundOrderItemPayload: {
                item_type: BigCommerceRefundableItemType.order,
                item_id: bigcommerceOrder.id,
                amount: amountToRefund,
            },
        })
    })

    it("should update external state with raw data when the agent's input is not valid, but numerical", () => {
        const amountToRefund = availableAmount + 1

        const dispatchRefundOrderStateMock = jest.fn()

        render(
            <ManualAmountRefundOrderModal
                {...initialProps}
                dispatchRefundOrderState={dispatchRefundOrderStateMock}
            />
        )
        act(() => jest.runAllTimers())

        // Agent types an invalid numerical amount to refund => it will trigger a hook call with raw data
        fireEvent.change(screen.getByRole('spinbutton'), {
            target: {value: amountToRefund},
        })
        act(() => jest.runAllTimers())

        expect(dispatchRefundOrderStateMock).toHaveBeenCalledTimes(3)

        // First call in `onResetRefundMethodData`
        expect(dispatchRefundOrderStateMock).toHaveBeenNthCalledWith(1, {
            type: BigCommerceRefundActionType.ResetRefundMethodState,
        })
        expect(dispatchRefundOrderStateMock).toHaveBeenNthCalledWith(2, {
            type: BigCommerceRefundActionType.SetRefundItemsPayloadEmptyList,
        })
        expect(dispatchRefundOrderStateMock).toHaveBeenNthCalledWith(3, {
            type: BigCommerceRefundActionType.SetSelectedPaymentOption,
            selectedPaymentOption: null,
        })
    })

    it('should test behavior when the order is fully refunded - zero available amount left for refund', () => {
        const amountToRefund = 1

        const dispatchRefundOrderStateMock = jest.fn()

        const {container} = render(
            <ManualAmountRefundOrderModal
                {...zeroAmountToRefundProps}
                dispatchRefundOrderState={dispatchRefundOrderStateMock}
            />
        )

        expect(container).toMatchSnapshot()

        act(() => jest.runAllTimers())

        // Agent types an invalid numerical amount to refund => it will trigger a hook call with raw data
        fireEvent.change(screen.getByRole('spinbutton'), {
            target: {value: amountToRefund},
        })
        act(() => jest.runAllTimers())

        expect(dispatchRefundOrderStateMock).toHaveBeenCalledTimes(3)

        // First call in `onResetRefundMethodData`
        expect(dispatchRefundOrderStateMock).toHaveBeenNthCalledWith(1, {
            type: BigCommerceRefundActionType.ResetRefundMethodState,
        })
        expect(dispatchRefundOrderStateMock).toHaveBeenNthCalledWith(2, {
            type: BigCommerceRefundActionType.SetRefundItemsPayloadEmptyList,
        })
        expect(dispatchRefundOrderStateMock).toHaveBeenNthCalledWith(3, {
            type: BigCommerceRefundActionType.SetSelectedPaymentOption,
            selectedPaymentOption: null,
        })

        expect(container).toMatchSnapshot()
    })
})
