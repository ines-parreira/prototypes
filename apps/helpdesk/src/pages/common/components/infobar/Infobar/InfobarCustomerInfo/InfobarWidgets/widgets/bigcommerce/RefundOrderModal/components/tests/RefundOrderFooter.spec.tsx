import { ComponentProps } from 'react'

import { userEvent } from '@repo/testing'
import { act, render, screen, waitFor } from '@testing-library/react'

import { BigCommerceRefundActionType } from '../../types'
import { RefundOrderFooter } from '../RefundOrderFooter'

type Props = ComponentProps<typeof RefundOrderFooter>

const initialProps: Props = {
    newOrderStatus: null,
    dispatchRefundOrderState: jest.fn(),
    isLoading: false,
}

jest.useFakeTimers()

describe('RefundOrderFooter', () => {
    it('snapshot renders the initial disabled state', () => {
        const { container } = render(
            <RefundOrderFooter {...initialProps} isLoading={true} />,
        )

        expect(container).toMatchSnapshot()
    })

    it('snapshot renders the initial state', () => {
        const { container } = render(<RefundOrderFooter {...initialProps} />)

        expect(container).toMatchSnapshot()
    })

    it("should update external state with user's data", async () => {
        const refundReason = 'Test refund'
        const newOrderStatus = 'Partially Shipped'

        const dispatchRefundOrderStateMock = jest.fn()

        render(
            <RefundOrderFooter
                {...initialProps}
                dispatchRefundOrderState={dispatchRefundOrderStateMock}
            />,
        )

        // Agent types a refund reason and checks the `Mark order as Cancelled in BigCommerce` checkbox =>
        // it will trigger a hook call with user's data
        await userEvent.type(screen.getByRole('textbox'), refundReason)
        act(() => jest.runAllTimers())

        await userEvent.click(screen.getByRole('combobox'))
        await waitFor(() => {
            expect(
                screen.getByRole('option', { name: /Partially Shipped/ }),
            ).toBeInTheDocument()
        })
        await userEvent.click(
            screen.getByRole('option', { name: /Partially Shipped/ }),
        )

        await waitFor(() => {
            expect(dispatchRefundOrderStateMock).toHaveBeenCalledTimes(2)
            expect(dispatchRefundOrderStateMock).toHaveBeenNthCalledWith(1, {
                type: BigCommerceRefundActionType.SetRefundReason,
                refundReason: refundReason,
            })
            expect(dispatchRefundOrderStateMock).toHaveBeenNthCalledWith(2, {
                type: BigCommerceRefundActionType.SetNewOrderStatus,
                newOrderStatus: newOrderStatus,
            })
        })
    })
})
