import React, {ComponentProps} from 'react'
import userEvent from '@testing-library/user-event'
import {render, screen} from '@testing-library/react'
import {act} from '@testing-library/react-hooks'
import {RefundOrderFooter} from '../RefundOrderFooter'

type Props = ComponentProps<typeof RefundOrderFooter>

const initialProps: Props = {
    setRefundReason: jest.fn(),
    newOrderStatus: null,
    setNewOrderStatus: jest.fn(),
    isLoading: false,
}

jest.useFakeTimers()

describe('RefundOrderFooter', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('snapshot renders the initial disabled state', () => {
        const {container} = render(
            <RefundOrderFooter {...initialProps} isLoading={true} />
        )

        expect(container).toMatchSnapshot()
    })

    it('snapshot renders the initial state', () => {
        const {container} = render(<RefundOrderFooter {...initialProps} />)

        expect(container).toMatchSnapshot()
    })

    it("should update external state with user's data", async () => {
        const refundReason = 'Test refund'
        const newOrderStatus = 'Partially Shipped'

        const setRefundReasonMock = jest.fn()
        const setNewOrderStatusMock = jest.fn()

        render(
            <RefundOrderFooter
                {...initialProps}
                setRefundReason={setRefundReasonMock}
                setNewOrderStatus={setNewOrderStatusMock}
            />
        )

        // Agent types a refund reason and checks the `Mark order as Cancelled in BigCommerce` checkbox =>
        // it will trigger a hook call with user's data
        await userEvent.type(screen.getByRole('textbox'), refundReason)
        act(() => jest.runAllTimers())
        userEvent.click(screen.getByRole('listbox'))
        userEvent.click(screen.getByRole('option', {name: /Partially Shipped/}))

        expect(setRefundReasonMock).toHaveBeenCalledTimes(1)
        expect(setRefundReasonMock).toHaveBeenCalledWith(refundReason)
        expect(setNewOrderStatusMock).toHaveBeenCalledTimes(1)
        expect(setNewOrderStatusMock).toHaveBeenCalledWith(newOrderStatus)
    })
})
