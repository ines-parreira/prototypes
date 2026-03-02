import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { Invoice } from 'state/billing/types'
import { PaymentIntentStatus, PaymentType } from 'state/billing/types'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'

import PaymentsHistoryView from '../PaymentsHistoryView'

jest.mock('@repo/logging')

const logEventMock = assumeMock(logEvent)
const middlewares = [thunk]
const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>(
    middlewares,
)

const server = setupServer()

const mockPayInvoice = jest.fn()
const mockConfirmInvoicePayment = jest.fn()

jest.mock('services/gorgiasApi', () => {
    return jest.fn().mockImplementation(() => ({
        payInvoice: mockPayInvoice,
        confirmInvoicePayment: mockConfirmInvoicePayment,
    }))
})

const defaultInvoice: Invoice = {
    description: 'Pro for the period from 2023-04-26 to 2023-04-28',
    invoice_pdf: '#',
    total: 322052,
    amount_due: 322052,
    amount_paid: 0,
    payment_intent: { status: PaymentIntentStatus.Succeeded },
    payment_confirmation_url: null,
    attempted: true,
    id: 'in_1N1DawI9qXomtXqStoF23sQ8',
    paid: true,
    date: 1682535698,
    metadata: { payment_service: PaymentType.Stripe },
}

const invoiceRequiringSource: Invoice = {
    ...defaultInvoice,
    payment_intent: { status: PaymentIntentStatus.RequiresSource },
    paid: false,
}

const invoiceRequiringPaymentMethod: Invoice = {
    ...defaultInvoice,
    payment_intent: { status: PaymentIntentStatus.RequiresPaymentMethod },
    paid: false,
}

describe('PaymentsHistoryView', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'warn' })
    })

    afterEach(() => {
        server.resetHandlers()
        jest.clearAllMocks()
        logEventMock.mockClear()
        mockPayInvoice.mockClear()
        mockConfirmInvoicePayment.mockClear()
    })

    afterAll(() => {
        server.close()
    })

    const renderComponent = (invoices: Invoice[] = [defaultInvoice]) => {
        const store = mockedStore({})
        const { QueryClientProvider, queryClient } = mockQueryClientProvider()

        server.use(
            http.get('/api/billing/invoices', ({ request }) => {
                const url = new URL(request.url)
                if (url.searchParams.get('limit') !== '20') {
                    return HttpResponse.json(
                        { error: 'Unexpected limit param' },
                        { status: 400 },
                    )
                }
                return HttpResponse.json({
                    data: invoices,
                    meta: {
                        next_cursor: null,
                    },
                })
            }),
        )

        return {
            ...render(
                <MemoryRouter>
                    <Provider store={store}>
                        <QueryClientProvider>
                            <PaymentsHistoryView />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            ),
            store,
            queryClient,
        }
    }

    it('renders table without data rows when loading', () => {
        const store = mockedStore({})
        const { QueryClientProvider } = mockQueryClientProvider()

        // Don't mock the invoices handler so the query stays in loading state
        render(
            <MemoryRouter>
                <Provider store={store}>
                    <QueryClientProvider>
                        <PaymentsHistoryView />
                    </QueryClientProvider>
                </Provider>
            </MemoryRouter>,
        )

        expect(screen.queryByText('Retry Payment')).not.toBeInTheDocument()
        expect(screen.queryByText('Download PDF')).not.toBeInTheDocument()
    })

    it('renders invoices table when loaded', async () => {
        const { container } = renderComponent()

        await waitFor(() =>
            expect(container.querySelector('table')).toBeInTheDocument(),
        )
    })

    it('renders Retry Payment button for invoices having payment_intent status at `requires_source`', async () => {
        renderComponent([invoiceRequiringSource])

        await waitFor(() =>
            expect(screen.getByText('Retry Payment')).toBeInTheDocument(),
        )
    })

    it('renders Retry Payment button for invoices having payment_intent status at `requires_payment_method`', async () => {
        renderComponent([invoiceRequiringPaymentMethod])

        await waitFor(() =>
            expect(screen.getByText('Retry Payment')).toBeInTheDocument(),
        )
    })

    it('triggers retry payment when Retry Payment button is clicked', async () => {
        mockPayInvoice.mockResolvedValue(undefined)

        renderComponent([invoiceRequiringSource])
        const user = userEvent.setup()

        const retryButton = await screen.findByText('Retry Payment')
        await act(() => user.click(retryButton))

        await waitFor(() => {
            expect(mockPayInvoice).toBeCalledWith(invoiceRequiringSource.id)
        })
    })

    it('does not render Retry Payment button when invoice has payment schedules', async () => {
        const invoiceWithPaymentSchedules: Invoice = {
            description: 'Pro for the period from 2023-04-26 to 2023-04-28',
            invoice_pdf: '#',
            total: 322052,
            amount_due: 322052,
            amount_paid: 0,
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

        const { container } = renderComponent([invoiceWithPaymentSchedules])

        await waitFor(() =>
            expect(container.querySelector('table')).toBeInTheDocument(),
        )

        expect(screen.queryByText('Retry Payment')).not.toBeInTheDocument()
    })

    describe('BillingPaymentHistoryTabVisited tracking', () => {
        it('should track event when Payment History page is visited', () => {
            renderComponent()

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
            renderComponent()
            const user = userEvent.setup()

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
            mockPayInvoice.mockResolvedValue(undefined)

            renderComponent([invoiceRequiringSource])
            const user = userEvent.setup()

            const retryButton = await screen.findByText('Retry Payment')

            logEventMock.mockClear()

            await act(() => user.click(retryButton))

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
            total: 322052,
            amount_due: 322052,
            amount_paid: 0,
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
            renderComponent([invoiceRequiringConfirmation])

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

            mockConfirmInvoicePayment.mockResolvedValue({
                toJS: () => invoiceWithConfirmationUrl,
            })

            renderComponent([invoiceRequiringConfirmation])
            const user = userEvent.setup()

            const originalLocation = window.location.href
            delete (window as { location?: unknown }).location
            ;(window as unknown as { location: Location }).location = {
                href: originalLocation,
            } as Location

            const confirmButton = await screen.findByText('Confirm')
            await act(() => user.click(confirmButton))

            await waitFor(() => {
                expect(mockConfirmInvoicePayment).toHaveBeenCalledWith(
                    invoiceRequiringConfirmation.id,
                )
                expect(window.location.href).toBe(confirmationUrl)
            })
        })

        it('invalidates query when payment_confirmation_url is null', async () => {
            const updatedInvoice: Invoice = {
                ...invoiceRequiringConfirmation,
                payment_confirmation_url: null,
            }

            mockConfirmInvoicePayment.mockResolvedValue({
                toJS: () => updatedInvoice,
            })

            const { queryClient } = renderComponent([
                invoiceRequiringConfirmation,
            ])
            const user = userEvent.setup()

            const confirmButton = await screen.findByText('Confirm')
            await act(() => user.click(confirmButton))

            await waitFor(() => {
                expect(mockConfirmInvoicePayment).toHaveBeenCalledWith(
                    invoiceRequiringConfirmation.id,
                )
                expect(
                    queryClient.getQueryCache().getAll().length,
                ).toBeGreaterThan(0)
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

            renderComponent([invoiceRequiringConfirmation])
            const user = userEvent.setup()

            const confirmButton = await screen.findByText('Confirm')

            await act(() => user.click(confirmButton))

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

            renderComponent([invoiceRequiringConfirmation])
            const user = userEvent.setup()

            const confirmButton = await screen.findByText('Confirm')

            await act(() => user.click(confirmButton))

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
            mockConfirmInvoicePayment.mockResolvedValue({ toJS: () => ({}) })

            renderComponent([invoiceRequiringSource])
            const user = userEvent.setup()

            const retryButton = await screen.findByText('Retry Payment')
            await act(() => user.click(retryButton))

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

            renderComponent([invoiceRequiringSource])
            const user = userEvent.setup()

            const retryButton = await screen.findByText('Retry Payment')
            await act(() => user.click(retryButton))

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

            renderComponent([invoiceRequiringSource])
            const user = userEvent.setup()

            const retryButton = await screen.findByText('Retry Payment')
            await act(() => user.click(retryButton))

            await waitFor(() => {
                expect(mockPayInvoice).toHaveBeenCalledWith(
                    invoiceRequiringSource.id,
                )
            })
        })

        it('calls payInvoice successfully and invalidates query', async () => {
            mockPayInvoice.mockResolvedValue(undefined)

            const { queryClient } = renderComponent([invoiceRequiringSource])
            const user = userEvent.setup()

            const retryButton = await screen.findByText('Retry Payment')
            await act(() => user.click(retryButton))

            await waitFor(() => {
                expect(mockPayInvoice).toHaveBeenCalledWith(
                    invoiceRequiringSource.id,
                )
                expect(
                    queryClient.getQueryCache().getAll().length,
                ).toBeGreaterThan(0)
            })
        })

        it('resets invoiceBeingPaid state after successful payment', async () => {
            mockPayInvoice.mockResolvedValue(undefined)

            renderComponent([invoiceRequiringSource])
            const user = userEvent.setup()

            const retryButton = await screen.findByText('Retry Payment')
            await act(() => user.click(retryButton))

            await waitFor(() => {
                expect(mockPayInvoice).toHaveBeenCalledWith(
                    invoiceRequiringSource.id,
                )
            })
        })
    })
})
