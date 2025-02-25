import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { RootState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import AddSalesCouponModal from '../AddSalesCouponModal'

const availableCoupons = ['sales-hd-year-05%-once', 'sales-hd-year-10%-once']

const queryClient = mockQueryClient()
const mockStore = configureMockStore([thunk])
jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(() => () => Promise.resolve()),
}))

const onCloseModal = jest.fn()
const title = 'title'

describe('AddSalesCouponModal', () => {
    it('should show the available coupon', () => {
        render(
            <Provider store={mockStore({} as RootState)}>
                <QueryClientProvider client={queryClient}>
                    <AddSalesCouponModal
                        onCloseModal={onCloseModal}
                        isModalOpen={true}
                        title={title}
                        availableCoupons={availableCoupons}
                        alreadyAppliedCoupon={undefined}
                    />
                </QueryClientProvider>
            </Provider>,
        )
        const items = document.getElementsByClassName('dropdown-item')
        expect(items[0]).toHaveTextContent(availableCoupons[0])
        expect(items[1]).toHaveTextContent(availableCoupons[1])

        expect(
            screen.queryByRole('button', { name: 'Delete Coupon' }),
        ).not.toBeInTheDocument()
        screen.getByRole('button', { name: 'Cancel' })
        screen.getByRole('button', { name: 'Apply Coupon' })
    })

    it('should show the selected coupon and the Delete Coupon button when a coupon has already been applied', () => {
        const expectedSelectedCoupon = availableCoupons[1]
        render(
            <Provider store={mockStore({} as RootState)}>
                <QueryClientProvider client={queryClient}>
                    <AddSalesCouponModal
                        onCloseModal={onCloseModal}
                        isModalOpen={true}
                        title={title}
                        availableCoupons={availableCoupons}
                        alreadyAppliedCoupon={expectedSelectedCoupon}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        const selectedCoupon = screen.getByLabelText('Select coupon')
        selectedCoupon.click()
        const items = screen.getAllByRole('menuitem')

        expect(selectedCoupon).toHaveTextContent(expectedSelectedCoupon)
        expect(items[0]).toHaveTextContent(availableCoupons[0])
        expect(items[1]).toHaveTextContent(availableCoupons[1])

        expect(
            screen.getByRole('button', { name: 'Delete Coupon' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Cancel' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Apply Coupon' }),
        ).toBeInTheDocument()
    })

    it('should not be possible to click on "Apply Coupon" button before a coupon is selected and a reason is given', () => {
        render(
            <Provider store={mockStore({} as RootState)}>
                <QueryClientProvider client={queryClient}>
                    <AddSalesCouponModal
                        onCloseModal={onCloseModal}
                        isModalOpen={true}
                        title={title}
                        availableCoupons={availableCoupons}
                        alreadyAppliedCoupon={undefined}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        const applyCouponButton = screen.getByRole('button', {
            name: 'Apply Coupon',
        })

        expect(applyCouponButton).toBeAriaDisabled()

        const items = document.getElementsByClassName('dropdown-item')
        fireEvent.click(items[0])

        expect(applyCouponButton).toBeAriaDisabled()

        const reasonTextBox = screen.getByPlaceholderText('Your reason')
        fireEvent.change(reasonTextBox, {
            target: { value: 'a good reason' },
        })

        expect(applyCouponButton).toBeAriaEnabled()
        fireEvent.click(applyCouponButton)
    })
})
