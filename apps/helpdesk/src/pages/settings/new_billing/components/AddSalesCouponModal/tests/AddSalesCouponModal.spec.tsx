import { render } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError } from 'axios'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { toast } from '@gorgias/axiom'

import { addSalesCoupon, deleteSalesCoupon } from 'models/billing/resources'
import type { RootState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import AddSalesCouponModal from '../AddSalesCouponModal'

const availableCoupons = ['sales-hd-year-05%-once', 'sales-hd-year-10%-once']

const queryClient = mockQueryClient()
const mockStore = configureMockStore([thunk])
jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(() => () => Promise.resolve()),
}))
jest.mock('models/billing/resources', () => ({
    addSalesCoupon: jest.fn(),
    deleteSalesCoupon: jest.fn(),
}))

const addSalesCouponMock = addSalesCoupon as jest.MockedFunction<
    typeof addSalesCoupon
>
const deleteSalesCouponMock = deleteSalesCoupon as jest.MockedFunction<
    typeof deleteSalesCoupon
>

const onCloseModal = jest.fn()
const title = 'title'

describe('AddSalesCouponModal', () => {
    beforeEach(() => {
        addSalesCouponMock.mockReset()
        deleteSalesCouponMock.mockReset()
    })

    afterEach(() => {
        toast.dismiss()
    })

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

    it('should show the selected coupon and the Delete Coupon button when a coupon has already been applied', async () => {
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
        await userEvent.click(selectedCoupon)
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

    it('should show a success toast when the coupon is applied', async () => {
        addSalesCouponMock.mockResolvedValueOnce(undefined as never)
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
        fireEvent.click(items[0])
        fireEvent.change(screen.getByPlaceholderText('Your reason'), {
            target: { value: 'a good reason' },
        })
        fireEvent.click(screen.getByRole('button', { name: 'Apply Coupon' }))

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: `${availableCoupons[0]} coupon has been successfully applied`,
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should show an error toast when applying the coupon fails', async () => {
        const axiosError = new AxiosError('invalid coupon')
        axiosError.response = {
            data: { error: { msg: 'invalid coupon' } },
        } as never
        addSalesCouponMock.mockRejectedValueOnce(axiosError)
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
        fireEvent.click(items[0])
        fireEvent.change(screen.getByPlaceholderText('Your reason'), {
            target: { value: 'a good reason' },
        })
        fireEvent.click(screen.getByRole('button', { name: 'Apply Coupon' }))

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: /Could not apply this coupon/i,
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should show a success toast when the coupon is deleted', async () => {
        deleteSalesCouponMock.mockResolvedValueOnce(undefined as never)
        render(
            <Provider store={mockStore({} as RootState)}>
                <QueryClientProvider client={queryClient}>
                    <AddSalesCouponModal
                        onCloseModal={onCloseModal}
                        isModalOpen={true}
                        title={title}
                        availableCoupons={availableCoupons}
                        alreadyAppliedCoupon={availableCoupons[0]}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        fireEvent.click(screen.getByRole('button', { name: 'Delete Coupon' }))

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Coupon has been successfully deleted',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should show an error toast when deleting the coupon fails', async () => {
        const axiosError = new AxiosError('not allowed')
        axiosError.response = {
            data: { error: { msg: 'not allowed' } },
        } as never
        deleteSalesCouponMock.mockRejectedValueOnce(axiosError)
        render(
            <Provider store={mockStore({} as RootState)}>
                <QueryClientProvider client={queryClient}>
                    <AddSalesCouponModal
                        onCloseModal={onCloseModal}
                        isModalOpen={true}
                        title={title}
                        availableCoupons={availableCoupons}
                        alreadyAppliedCoupon={availableCoupons[0]}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        fireEvent.click(screen.getByRole('button', { name: 'Delete Coupon' }))

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: /Could not delete the coupon from the subscription/i,
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
