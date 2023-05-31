import React, {ComponentProps} from 'react'
import userEvent from '@testing-library/user-event'
import {render, screen} from '@testing-library/react'
import {act} from '@testing-library/react-hooks'
import {RefundOrderFooter} from '../RefundOrderFooter'

type Props = ComponentProps<typeof RefundOrderFooter>

const initialProps: Props = {
    setRefundReason: jest.fn(),
    orderIsCancelled: false,
    setOrderIsCancelled: jest.fn(),
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

        const setRefundReasonMock = jest.fn()
        const setOrderIsCancelledMock = jest.fn()

        render(
            <RefundOrderFooter
                {...initialProps}
                setRefundReason={setRefundReasonMock}
                setOrderIsCancelled={setOrderIsCancelledMock}
            />
        )

        // Agent types a refund reason and checks the `Mark order as Cancelled in BigCommerce` checkbox =>
        // it will trigger a hook call with user's data
        await userEvent.type(screen.getByRole('textbox'), refundReason)
        act(() => jest.runAllTimers())
        userEvent.click(screen.getByRole('checkbox'))

        expect(setRefundReasonMock).toHaveBeenCalledTimes(1)
        expect(setRefundReasonMock).toHaveBeenCalledWith(refundReason)
        expect(setOrderIsCancelledMock).toHaveBeenCalledTimes(1)
        expect(setOrderIsCancelledMock).toHaveBeenCalledWith(true)
    })
})
