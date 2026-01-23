import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { invoices } from 'fixtures/invoices'
import client from 'models/api/resources'
import type { Invoice } from 'state/billing/types'
import { PaymentIntentStatus, PaymentType } from 'state/billing/types'
import type { RootState, StoreDispatch } from 'state/types'

import PaymentsHistoryView from '../PaymentsHistoryView'

jest.mock('@repo/logging')

const logEventMock = assumeMock(logEvent)
const middlewares = [thunk]
const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>(
    middlewares,
)

const store = mockedStore({
    billing: fromJS({ invoices, products: [] }),
})

const mockPayInvoice = jest.fn()
const mockConfirmInvoicePayment = jest.fn()

const invoiceRequiringSource: Invoice = {
    description: 'Pro for the period from 2023-04-26 to 2023-04-28',
    invoice_pdf: '#',
    amount_due: 322052,
    payment_intent: { status: PaymentIntentStatus.RequiresSource },
    payment_confirmation_url: null,
    attempted: true,
    id: 'in_1N1DawI9qXomtXqStoF23sQ8',
    paid: false,
    date: 1682535698,
    metadata: { payment_service: PaymentType.Stripe },
}

const invoiceRequiringPaymentMethod: Invoice = {
    description: 'Pro for the period from 2023-04-26 to 2023-04-28',
    invoice_pdf: '#',
    amount_due: 322052,
    payment_intent: { status: PaymentIntentStatus.RequiresPaymentMethod },
    payment_confirmation_url: null,
    attempted: true,
    id: 'in_1N1DawI9qXomtXqStoF23sQ8',
    paid: false,
    date: 1682535698,
    metadata: { payment_service: PaymentType.Stripe },
}

jest.mock('services/gorgiasApi', () => {
    return jest.fn().mockImplementation(() => ({
        payInvoice: mockPayInvoice,
        confirmInvoicePayment: mockConfirmInvoicePayment,
    }))
})

describe('PaymentsHistoryView', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        logEventMock.mockClear()
        mockPayInvoice.mockReturnValue(Promise.resolve())
        mockConfirmInvoicePayment.mockReturnValue(Promise.resolve())
    })

    it('renders loader when loading', () => {
        render(
            <MemoryRouter>
                <Provider store={store}>
                    <PaymentsHistoryView />
                </Provider>
            </MemoryRouter>,
        )

        expect(screen.getByTestId('loader')).toBeInTheDocument()
    })

    it('renders invoices table when loaded', async () => {
        const { container } = render(
            <MemoryRouter>
                <Provider store={store}>
                    <PaymentsHistoryView />
                </Provider>
            </MemoryRouter>,
        )

        await waitFor(() =>
            expect(container.querySelector('table')).toBeInTheDocument(),
        )
    })

    it('renders Retry Payment button for invoices having payment_intent status at `requires_source`', async () => {
        const store = mockedStore({
            billing: fromJS({
                invoices: [invoiceRequiringSource],
                products: [],
            }),
        })

        render(
            <MemoryRouter>
                <Provider store={store}>
                    <PaymentsHistoryView />
                </Provider>
            </MemoryRouter>,
        )

        await waitFor(() =>
            expect(screen.getByText('Retry Payment')).toBeInTheDocument(),
        )
    })

    it('renders Retry Payment button for invoices having payment_intent status at `requires_payment_method`', async () => {
        const store = mockedStore({
            billing: fromJS({
                invoices: [invoiceRequiringPaymentMethod],
                products: [],
            }),
        })

        render(
            <MemoryRouter>
                <Provider store={store}>
                    <PaymentsHistoryView />
                </Provider>
            </MemoryRouter>,
        )

        await waitFor(() =>
            expect(screen.getByText('Retry Payment')).toBeInTheDocument(),
        )
    })

    it('triggers retry payment when Retry Payment button is clicked', async () => {
        const apiMock = new MockAdapter(client)
        apiMock.onAny().reply(200, {})

        const store = mockedStore({
            billing: fromJS({
                invoices: [invoiceRequiringSource],
                products: [],
            }),
        })

        const user = userEvent.setup()
        const { container } = render(
            <MemoryRouter>
                <Provider store={store}>
                    <PaymentsHistoryView />
                </Provider>
            </MemoryRouter>,
        )

        await waitFor(() =>
            expect(container.querySelector('table')).toBeInTheDocument(),
        )

        await user.click(screen.getByText('Retry Payment'))

        await waitFor(() => {
            expect(mockPayInvoice).toBeCalledWith(invoices[0].id)
        })
    })

    it('does not render Retry Payment button when invoice has payment schedules', async () => {
        const invoiceWithPaymentSchedules: Invoice = {
            description: 'Pro for the period from 2023-04-26 to 2023-04-28',
            invoice_pdf: '#',
            amount_due: 322052,
            payment_intent: {
                status: PaymentIntentStatus.RequiresPaymentMethod,
            },
            payment_confirmation_url: null,
            attempted: true,
            id: 'in_1N1DawI9qXomtXqStoF23sQ8',
            paid: false,
            date: 1682535698,
            metadata: { payment_service: PaymentType.Stripe },
            has_payment_schedules: true,
        }

        const store = mockedStore({
            billing: fromJS({
                invoices: [invoiceWithPaymentSchedules],
                products: [],
            }),
        })

        const { container } = render(
            <MemoryRouter>
                <Provider store={store}>
                    <PaymentsHistoryView />
                </Provider>
            </MemoryRouter>,
        )

        await waitFor(() =>
            expect(container.querySelector('table')).toBeInTheDocument(),
        )

        expect(screen.queryByText('Retry Payment')).not.toBeInTheDocument()
    })

    describe('BillingPaymentHistoryTabVisited tracking', () => {
        it('should track event when Payment History page is visited', () => {
            render(
                <MemoryRouter>
                    <Provider store={store}>
                        <PaymentsHistoryView />
                    </Provider>
                </MemoryRouter>,
            )

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingPaymentHistoryTabVisited,
                {
                    url: '/',
                },
            )
            expect(logEventMock).toHaveBeenCalledTimes(1)
        })
    })

    describe('BillingPaymentHistoryDownloadPdfClicked tracking', () => {
        it('should track event when Download PDF link is clicked', async () => {
            const user = userEvent.setup()
            render(
                <MemoryRouter>
                    <Provider store={store}>
                        <PaymentsHistoryView />
                    </Provider>
                </MemoryRouter>,
            )

            const downloadLinks = await screen.findAllByText('Download PDF')

            logEventMock.mockClear()

            await user.click(downloadLinks[0])

            await waitFor(() => {
                expect(logEventMock).toHaveBeenCalledWith(
                    SegmentEvent.BillingPaymentHistoryDownloadPdfClicked,
                )
                expect(logEventMock).toHaveBeenCalledTimes(1)
            })
        })
    })

    describe('BillingPaymentHistoryRetryPaymentClicked tracking', () => {
        it('should track event when Retry Payment button is clicked', async () => {
            const apiMock = new MockAdapter(client)
            apiMock.onAny().reply(200, {})

            const store = mockedStore({
                billing: fromJS({
                    invoices: [invoiceRequiringSource],
                    products: [],
                }),
            })

            const user = userEvent.setup()
            render(
                <MemoryRouter>
                    <Provider store={store}>
                        <PaymentsHistoryView />
                    </Provider>
                </MemoryRouter>,
            )

            const retryButton = await screen.findByText('Retry Payment')

            logEventMock.mockClear()

            await user.click(retryButton)

            await waitFor(() => {
                expect(logEventMock).toHaveBeenCalledWith(
                    SegmentEvent.BillingPaymentHistoryRetryPaymentClicked,
                )
                expect(logEventMock).toHaveBeenCalledTimes(1)
            })
        })
    })

    describe('confirmPayment function', () => {
        const invoiceRequiringConfirmation: Invoice = {
            description: 'Pro for the period from 2023-04-26 to 2023-04-28',
            invoice_pdf: '#',
            amount_due: 322052,
            payment_intent: {
                status: PaymentIntentStatus.RequiresConfirmation,
            },
            payment_confirmation_url: null,
            attempted: true,
            id: 'in_1N1DawI9qXomtXqStoF23sQ9',
            paid: false,
            date: 1682535698,
            metadata: { payment_service: PaymentType.Stripe },
        }

        it('renders Confirm button for invoices requiring confirmation', async () => {
            const store = mockedStore({
                billing: fromJS({
                    invoices: [invoiceRequiringConfirmation],
                    products: [],
                }),
            })

            render(
                <MemoryRouter>
                    <Provider store={store}>
                        <PaymentsHistoryView />
                    </Provider>
                </MemoryRouter>,
            )

            await waitFor(() =>
                expect(screen.getByText('Confirm')).toBeInTheDocument(),
            )
        })

        it('redirects to payment_confirmation_url when present', async () => {
            const confirmationUrl = 'https://example.com/confirm-payment'
            const invoiceWithConfirmationUrl: Invoice = {
                ...invoiceRequiringConfirmation,
                payment_confirmation_url: confirmationUrl,
            }

            mockConfirmInvoicePayment.mockReturnValue(
                Promise.resolve(fromJS(invoiceWithConfirmationUrl)),
            )

            const store = mockedStore({
                billing: fromJS({
                    invoices: [invoiceRequiringConfirmation],
                    products: [],
                }),
            })

            const user = userEvent.setup()
            const originalLocation = window.location.href

            delete (window as { location?: unknown }).location
            window.location = { href: originalLocation } as Location

            render(
                <MemoryRouter>
                    <Provider store={store}>
                        <PaymentsHistoryView />
                    </Provider>
                </MemoryRouter>,
            )

            const confirmButton = await screen.findByText('Confirm')
            await user.click(confirmButton)

            await waitFor(() => {
                expect(mockConfirmInvoicePayment).toHaveBeenCalledWith(
                    invoiceRequiringConfirmation.id,
                )
                expect(window.location.href).toBe(confirmationUrl)
            })
        })

        it('dispatches updateInvoiceInList when payment_confirmation_url is null', async () => {
            const updatedInvoice: Invoice = {
                ...invoiceRequiringConfirmation,
                payment_confirmation_url: null,
            }

            mockConfirmInvoicePayment.mockReturnValue(
                Promise.resolve(fromJS(updatedInvoice)),
            )

            const store = mockedStore({
                billing: fromJS({
                    invoices: [invoiceRequiringConfirmation],
                    products: [],
                }),
            })

            const user = userEvent.setup()
            render(
                <MemoryRouter>
                    <Provider store={store}>
                        <PaymentsHistoryView />
                    </Provider>
                </MemoryRouter>,
            )

            const confirmButton = await screen.findByText('Confirm')
            await user.click(confirmButton)

            await waitFor(() => {
                expect(mockConfirmInvoicePayment).toHaveBeenCalledWith(
                    invoiceRequiringConfirmation.id,
                )
                expect(store.getActions()).toContainEqual(
                    expect.objectContaining({
                        type: 'UPDATE_INVOICE_IN_LIST',
                    }),
                )
            })
        })

        it('calls confirmInvoicePayment when API returns error with custom message', async () => {
            const errorMessage = 'Payment confirmation failed'
            mockConfirmInvoicePayment.mockRejectedValue({
                response: {
                    data: {
                        error: {
                            msg: errorMessage,
                        },
                    },
                },
            })

            const store = mockedStore({
                billing: fromJS({
                    invoices: [invoiceRequiringConfirmation],
                    products: [],
                }),
            })

            const user = userEvent.setup()
            render(
                <MemoryRouter>
                    <Provider store={store}>
                        <PaymentsHistoryView />
                    </Provider>
                </MemoryRouter>,
            )

            const confirmButton = await screen.findByText('Confirm')

            await user.click(confirmButton)

            await waitFor(
                () => {
                    expect(mockConfirmInvoicePayment).toHaveBeenCalledWith(
                        invoiceRequiringConfirmation.id,
                    )
                },
                { timeout: 2000 },
            )
        })

        it('calls confirmInvoicePayment when API returns error without message', async () => {
            mockConfirmInvoicePayment.mockRejectedValue({
                response: {
                    data: {},
                },
            })

            const store = mockedStore({
                billing: fromJS({
                    invoices: [invoiceRequiringConfirmation],
                    products: [],
                }),
            })

            const user = userEvent.setup()
            render(
                <MemoryRouter>
                    <Provider store={store}>
                        <PaymentsHistoryView />
                    </Provider>
                </MemoryRouter>,
            )

            const confirmButton = await screen.findByText('Confirm')

            await user.click(confirmButton)

            await waitFor(
                () => {
                    expect(mockConfirmInvoicePayment).toHaveBeenCalledWith(
                        invoiceRequiringConfirmation.id,
                    )
                },
                { timeout: 2000 },
            )
        })
    })

    describe('retryPayment function error handling', () => {
        it('calls confirmPayment when payInvoice returns 402 status', async () => {
            mockPayInvoice.mockRejectedValue({
                response: {
                    status: 402,
                },
            })

            const store = mockedStore({
                billing: fromJS({
                    invoices: [invoiceRequiringSource],
                    products: [],
                }),
            })

            const user = userEvent.setup()
            render(
                <MemoryRouter>
                    <Provider store={store}>
                        <PaymentsHistoryView />
                    </Provider>
                </MemoryRouter>,
            )

            const retryButton = await screen.findByText('Retry Payment')
            await user.click(retryButton)

            await waitFor(() => {
                expect(mockPayInvoice).toHaveBeenCalledWith(
                    invoiceRequiringSource.id,
                )
                expect(mockConfirmInvoicePayment).toHaveBeenCalledWith(
                    invoiceRequiringSource.id,
                )
            })
        })

        it('dispatches error notification with custom message when payInvoice fails', async () => {
            const errorMessage = 'Insufficient funds'
            mockPayInvoice.mockRejectedValue({
                response: {
                    status: 400,
                    data: {
                        error: {
                            msg: errorMessage,
                        },
                    },
                },
            })

            const store = mockedStore({
                billing: fromJS({
                    invoices: [invoiceRequiringSource],
                    products: [],
                }),
            })

            const user = userEvent.setup()
            render(
                <MemoryRouter>
                    <Provider store={store}>
                        <PaymentsHistoryView />
                    </Provider>
                </MemoryRouter>,
            )

            const retryButton = await screen.findByText('Retry Payment')
            await user.click(retryButton)

            await waitFor(() => {
                expect(mockPayInvoice).toHaveBeenCalledWith(
                    invoiceRequiringSource.id,
                )
            })
        })

        it('dispatches error notification with default message when payInvoice fails without error message', async () => {
            mockPayInvoice.mockRejectedValue({
                response: {
                    status: 500,
                    data: {},
                },
            })

            const store = mockedStore({
                billing: fromJS({
                    invoices: [invoiceRequiringSource],
                    products: [],
                }),
            })

            const user = userEvent.setup()
            render(
                <MemoryRouter>
                    <Provider store={store}>
                        <PaymentsHistoryView />
                    </Provider>
                </MemoryRouter>,
            )

            const retryButton = await screen.findByText('Retry Payment')
            await user.click(retryButton)

            await waitFor(() => {
                expect(mockPayInvoice).toHaveBeenCalledWith(
                    invoiceRequiringSource.id,
                )
            })
        })

        it('calls payInvoice successfully and updates invoice list', async () => {
            mockPayInvoice.mockResolvedValue(undefined)

            const store = mockedStore({
                billing: fromJS({
                    invoices: [invoiceRequiringSource],
                    products: [],
                }),
            })

            const user = userEvent.setup()
            render(
                <MemoryRouter>
                    <Provider store={store}>
                        <PaymentsHistoryView />
                    </Provider>
                </MemoryRouter>,
            )

            const retryButton = await screen.findByText('Retry Payment')
            await user.click(retryButton)

            await waitFor(() => {
                expect(mockPayInvoice).toHaveBeenCalledWith(
                    invoiceRequiringSource.id,
                )
                expect(store.getActions()).toContainEqual(
                    expect.objectContaining({
                        type: 'UPDATE_INVOICE_IN_LIST',
                    }),
                )
            })
        })

        it('resets invoiceBeingPaid state after successful payment', async () => {
            mockPayInvoice.mockResolvedValue(undefined)

            const store = mockedStore({
                billing: fromJS({
                    invoices: [invoiceRequiringSource],
                    products: [],
                }),
            })

            const user = userEvent.setup()
            const { container } = render(
                <MemoryRouter>
                    <Provider store={store}>
                        <PaymentsHistoryView />
                    </Provider>
                </MemoryRouter>,
            )

            await waitFor(() =>
                expect(container.querySelector('table')).toBeInTheDocument(),
            )

            const retryButton = screen.getByText('Retry Payment')
            await user.click(retryButton)

            await waitFor(() => {
                expect(mockPayInvoice).toHaveBeenCalledWith(
                    invoiceRequiringSource.id,
                )
            })
        })
    })
})
