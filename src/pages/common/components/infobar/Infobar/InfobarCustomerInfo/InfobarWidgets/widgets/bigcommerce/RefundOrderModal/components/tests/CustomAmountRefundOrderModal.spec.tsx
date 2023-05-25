import React, {ComponentProps} from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
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
    setTotalAmountToRefund: jest.fn(),
    setRefundItemsPayload: jest.fn(),
    currencyCode: null,
    isLoading: true,
    hasError: false,
}

const initialProps: Props = {
    refundData: {
        order: bigcommerceOrder,
        order_level_refund_data: {
            total_amount: 1234567.89,
            refunded_amount: 4567,
            available_amount: 1230000.89,
        },
    },
    setTotalAmountToRefund: jest.fn(),
    setRefundItemsPayload: jest.fn(),
    currencyCode: 'EUR',
    isLoading: false,
    hasError: false,
}

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

        const setTotalAmountToRefundMock = jest.fn()
        const setRefundItemsPayloadMock = jest.fn()

        render(
            <CustomAmountRefundOrderModal
                {...initialProps}
                setTotalAmountToRefund={setTotalAmountToRefundMock}
                setRefundItemsPayload={setRefundItemsPayloadMock}
            />
        )

        // Agent types an amount to refund => it will not trigger a hook call
        fireEvent.change(screen.getByRole('spinbutton'), {
            target: {value: amountToRefund},
        })

        expect(setTotalAmountToRefundMock).toHaveBeenCalledTimes(0)
        expect(setRefundItemsPayloadMock).toHaveBeenCalledTimes(0)

        // Agent moves to another field (the element loses focus) => it will trigger a hook call with user's data
        fireEvent.blur(screen.getByRole('spinbutton'))

        expect(setTotalAmountToRefundMock).toHaveBeenCalledTimes(1)
        expect(setTotalAmountToRefundMock).toHaveBeenCalledWith(amountToRefund)
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
    })

    it("should update external state with raw data when the agent's input is not valid", () => {
        const amountToRefund = 'abcdef'

        const setTotalAmountToRefundMock = jest.fn()
        const setRefundItemsPayloadMock = jest.fn()

        render(
            <CustomAmountRefundOrderModal
                {...initialProps}
                setTotalAmountToRefund={setTotalAmountToRefundMock}
                setRefundItemsPayload={setRefundItemsPayloadMock}
            />
        )

        // Agent types an invalid amount to refund => it will not trigger a hook call
        fireEvent.change(screen.getByRole('spinbutton'), {
            target: {value: amountToRefund},
        })

        expect(setTotalAmountToRefundMock).toHaveBeenCalledTimes(0)
        expect(setRefundItemsPayloadMock).toHaveBeenCalledTimes(0)

        // Agent moves to another field (the element loses focus) => it will trigger a hook call with raw data
        fireEvent.blur(screen.getByRole('spinbutton'))

        expect(setTotalAmountToRefundMock).toHaveBeenCalledTimes(1)
        expect(setTotalAmountToRefundMock).toHaveBeenCalledWith(0)
        expect(setRefundItemsPayloadMock).toHaveBeenCalledTimes(1)
        expect(setRefundItemsPayloadMock).toHaveBeenCalledWith({
            items: [
                {
                    amount: 0,
                    item_id: bigcommerceOrder.id,
                    item_type: BigCommerceRefundableItemType.order,
                },
            ],
        })
    })
})
