import { act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import type { Invoice } from 'state/billing/types'
import { PaymentIntentStatus, PaymentType } from 'state/billing/types'
import { renderHookWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { useInvoicePayment } from '../hooks/useInvoicePayment'

const mockPayInvoice = jest.fn()
const mockConfirmInvoicePayment = jest.fn()

jest.mock('services/gorgiasApi', () => {
    return jest.fn().mockImplementation(() => ({
        payInvoice: mockPayInvoice,
        confirmInvoicePayment: mockConfirmInvoicePayment,
    }))
})

const server = setupServer()

const makeInvoice = (overrides: Partial<Invoice> = {}): Invoice => ({
    description: 'Pro plan',
    invoice_pdf: 'https://example.com/invoice.pdf',
    total: 500000,
    amount_due: 500000,
    amount_paid: 500000,
    payment_intent: { status: PaymentIntentStatus.Succeeded },
    payment_confirmation_url: null,
    attempted: true,
    id: 'inv_001',
    paid: true,
    date: 1682535698,
    metadata: { payment_service: PaymentType.Stripe },
    ...overrides,
})

const page1Invoice = makeInvoice({ id: 'inv_page1' })
const page2Invoice = makeInvoice({ id: 'inv_page2' })

const setupSinglePageHandler = (invoices: Invoice[] = [page1Invoice]) => {
    server.use(
        http.get('/api/billing/invoices', () =>
            HttpResponse.json({
                data: invoices,
                meta: { next_cursor: null },
            }),
        ),
    )
}

const setupMultiPageHandler = () => {
    server.use(
        http.get('/api/billing/invoices', ({ request }) => {
            const url = new URL(request.url)
            const cursor = url.searchParams.get('cursor')

            if (cursor === 'cursor_page2') {
                return HttpResponse.json({
                    data: [page2Invoice],
                    meta: { next_cursor: null },
                })
            }

            return HttpResponse.json({
                data: [page1Invoice],
                meta: { next_cursor: 'cursor_page2' },
            })
        }),
    )
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

beforeEach(() => {
    server.use(
        http.get('/api/billing/invoices', () =>
            HttpResponse.json({
                data: [page1Invoice],
                meta: { next_cursor: null },
            }),
        ),
    )
})

afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
})

afterAll(() => server.close())

describe('useInvoicePayment', () => {
    describe('initial state', () => {
        it('returns isLoading=true before data is fetched', () => {
            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            expect(result.current.isLoading).toBe(false)
        })

        it('returns empty invoices before data is fetched', () => {
            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            expect(result.current.invoices).toEqual([])
        })

        it('returns hasPrevPage=false initially', () => {
            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            expect(result.current.hasPrevPage).toBe(false)
        })

        it('returns invoiceBeingPaid=null initially', () => {
            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            expect(result.current.invoiceBeingPaid).toBeNull()
        })
    })

    describe('after data loads', () => {
        it('returns isLoading=false after first page is fetched', async () => {
            setupSinglePageHandler()

            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
                expect(result.current.invoices).toHaveLength(1)
            })
        })

        it('returns invoices from the first page', async () => {
            setupSinglePageHandler([page1Invoice])

            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
                expect(result.current.invoices).toHaveLength(1)
            })
            expect(result.current.invoices[0].id).toBe('inv_page1')
        })

        it('returns hasNextPage=false when next_cursor is null', async () => {
            setupSinglePageHandler()

            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
                expect(result.current.invoices).toHaveLength(1)
            })
            expect(result.current.hasNextPage).toBe(false)
        })

        it('returns hasNextPage=true when next_cursor is present', async () => {
            setupMultiPageHandler()

            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
                expect(result.current.invoices).toHaveLength(1)
            })
            expect(result.current.hasNextPage).toBe(true)
        })

        it('returns hasPrevPage=false on first page', async () => {
            setupSinglePageHandler()

            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
                expect(result.current.invoices).toHaveLength(1)
            })
            expect(result.current.hasPrevPage).toBe(false)
        })
    })

    describe('pagination navigation', () => {
        it('goToNextPage fetches next page and shows page 2 invoices', async () => {
            setupMultiPageHandler()

            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
                expect(result.current.invoices[0].id).toBe('inv_page1')
            })

            await act(async () => {
                result.current.goToNextPage()
            })

            await waitFor(() =>
                expect(result.current.invoices[0].id).toBe('inv_page2'),
            )
        })

        it('goToNextPage sets hasPrevPage=true after navigating to page 2', async () => {
            setupMultiPageHandler()

            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
                expect(result.current.invoices[0].id).toBe('inv_page1')
            })

            await act(async () => {
                result.current.goToNextPage()
            })

            await waitFor(() => expect(result.current.hasPrevPage).toBe(true))
        })

        it('goToNextPage sets hasNextPage=false when on last page', async () => {
            setupMultiPageHandler()

            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
                expect(result.current.invoices[0].id).toBe('inv_page1')
            })

            await act(async () => {
                result.current.goToNextPage()
            })

            await waitFor(() => expect(result.current.hasNextPage).toBe(false))
        })

        it('goToPrevPage navigates back to page 1 from page 2', async () => {
            setupMultiPageHandler()

            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
                expect(result.current.invoices[0].id).toBe('inv_page1')
            })

            await act(async () => {
                result.current.goToNextPage()
            })

            await waitFor(() =>
                expect(result.current.invoices[0].id).toBe('inv_page2'),
            )

            await act(async () => {
                result.current.goToPrevPage()
            })

            await waitFor(() =>
                expect(result.current.invoices[0].id).toBe('inv_page1'),
            )
        })

        it('goToPrevPage sets hasPrevPage=false when back on page 1', async () => {
            setupMultiPageHandler()

            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
                expect(result.current.invoices[0].id).toBe('inv_page1')
            })

            await act(async () => {
                result.current.goToNextPage()
            })

            await waitFor(() => expect(result.current.hasPrevPage).toBe(true))

            await act(async () => {
                result.current.goToPrevPage()
            })

            await waitFor(() => expect(result.current.hasPrevPage).toBe(false))
        })

        it('goToPrevPage does nothing when already on the first page', async () => {
            setupSinglePageHandler()

            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
                expect(result.current.invoices[0].id).toBe('inv_page1')
            })

            await act(async () => {
                result.current.goToPrevPage()
            })

            expect(result.current.hasPrevPage).toBe(false)
            expect(result.current.invoices[0].id).toBe('inv_page1')
        })

        it('goToNextPage does nothing when hasNextPage is false', async () => {
            setupSinglePageHandler()

            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
                expect(result.current.invoices[0].id).toBe('inv_page1')
            })
            expect(result.current.hasNextPage).toBe(false)

            await act(async () => {
                result.current.goToNextPage()
            })

            expect(result.current.hasPrevPage).toBe(false)
        })

        it('resetPagination returns to page 1 after navigating to page 2', async () => {
            setupMultiPageHandler()

            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
                expect(result.current.invoices[0].id).toBe('inv_page1')
            })

            await act(async () => {
                result.current.goToNextPage()
            })

            await waitFor(() =>
                expect(result.current.invoices[0].id).toBe('inv_page2'),
            )

            await act(async () => {
                result.current.resetPagination()
            })

            await waitFor(() =>
                expect(result.current.invoices[0].id).toBe('inv_page1'),
            )
            expect(result.current.hasPrevPage).toBe(false)
        })

        it('goToNextPage navigates to already-cached page without fetching again', async () => {
            setupMultiPageHandler()

            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
                expect(result.current.invoices[0].id).toBe('inv_page1')
            })

            await act(async () => {
                result.current.goToNextPage()
            })

            await waitFor(() =>
                expect(result.current.invoices[0].id).toBe('inv_page2'),
            )

            await act(async () => {
                result.current.goToPrevPage()
            })

            await waitFor(() =>
                expect(result.current.invoices[0].id).toBe('inv_page1'),
            )

            await act(async () => {
                result.current.goToNextPage()
            })

            await waitFor(() =>
                expect(result.current.invoices[0].id).toBe('inv_page2'),
            )
        })
    })

    describe('retryPayment', () => {
        it('sets invoiceBeingPaid while payment is in progress', async () => {
            const invoice = makeInvoice({ paid: false })
            setupSinglePageHandler([invoice])

            let resolvePayment!: () => void
            mockPayInvoice.mockReturnValue(
                new Promise<void>((resolve) => {
                    resolvePayment = resolve
                }),
            )

            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
                expect(result.current.invoices[0].id).toBe(invoice.id)
            })

            await act(async () => {
                void result.current.retryPayment(invoice)
            })

            await waitFor(() =>
                expect(result.current.invoiceBeingPaid?.id).toBe(invoice.id),
            )

            await act(async () => {
                resolvePayment()
            })

            await waitFor(() =>
                expect(result.current.invoiceBeingPaid).toBeNull(),
            )
        })

        it('calls payInvoice with the invoice id', async () => {
            const invoice = makeInvoice({ paid: false })
            setupSinglePageHandler([invoice])
            mockPayInvoice.mockResolvedValue(undefined)

            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
                expect(result.current.invoices[0].id).toBe(invoice.id)
            })

            await act(async () => {
                await result.current.retryPayment(invoice)
            })

            expect(mockPayInvoice).toHaveBeenCalledWith(invoice.id)
        })

        it('calls confirmPayment when payInvoice returns a 402 error', async () => {
            const invoice = makeInvoice({ paid: false })
            setupSinglePageHandler([invoice])
            mockPayInvoice.mockRejectedValue({ response: { status: 402 } })
            mockConfirmInvoicePayment.mockResolvedValue({ toJS: () => ({}) })

            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
                expect(result.current.invoices[0].id).toBe(invoice.id)
            })

            await act(async () => {
                await result.current.retryPayment(invoice)
            })

            expect(mockConfirmInvoicePayment).toHaveBeenCalledWith(invoice.id)
        })

        it('throws error when payInvoice fails with a non-402 status', async () => {
            const invoice = makeInvoice({ paid: false })
            setupSinglePageHandler([invoice])
            const error = { response: { status: 500 } }
            mockPayInvoice.mockRejectedValue(error)

            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
                expect(result.current.invoices[0].id).toBe(invoice.id)
            })

            await expect(
                act(async () => {
                    await result.current.retryPayment(invoice)
                }),
            ).rejects.toMatchObject(error)
        })

        it('resets invoiceBeingPaid after payment fails', async () => {
            const invoice = makeInvoice({ paid: false })
            setupSinglePageHandler([invoice])
            mockPayInvoice.mockRejectedValue({ response: { status: 500 } })

            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            await act(async () => {
                await result.current.retryPayment(invoice).catch(() => {})
            })

            expect(result.current.invoiceBeingPaid).toBeNull()
        })
    })

    describe('confirmPayment', () => {
        it('sets invoiceBeingPaid while confirmation is in progress', async () => {
            const invoice = makeInvoice({ paid: false })
            setupSinglePageHandler([invoice])

            let resolveConfirm!: () => void
            mockConfirmInvoicePayment.mockReturnValue(
                new Promise<{ toJS: () => object }>((resolve) => {
                    resolveConfirm = () => resolve({ toJS: () => ({}) })
                }),
            )

            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
                expect(result.current.invoices[0].id).toBe(invoice.id)
            })

            await act(async () => {
                void result.current.confirmPayment(invoice)
            })

            await waitFor(() =>
                expect(result.current.invoiceBeingPaid?.id).toBe(invoice.id),
            )

            await act(async () => {
                resolveConfirm()
            })

            await waitFor(() =>
                expect(result.current.invoiceBeingPaid).toBeNull(),
            )
        })

        it('redirects to payment_confirmation_url when present', async () => {
            const confirmationUrl = 'https://stripe.com/confirm'
            const invoice = makeInvoice({ paid: false })
            setupSinglePageHandler([invoice])
            mockConfirmInvoicePayment.mockResolvedValue({
                toJS: () => ({ payment_confirmation_url: confirmationUrl }),
            })

            const originalLocation = window.location.href
            delete (window as { location?: unknown }).location
            window.location = { href: originalLocation } as Location

            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
                expect(result.current.invoices[0].id).toBe(invoice.id)
            })

            await act(async () => {
                await result.current.confirmPayment(invoice)
            })

            expect(window.location.href).toBe(confirmationUrl)
        })

        it('resets invoiceBeingPaid after confirmation is complete', async () => {
            const invoice = makeInvoice({ paid: false })
            setupSinglePageHandler([invoice])
            mockConfirmInvoicePayment.mockResolvedValue({
                toJS: () => ({ payment_confirmation_url: null }),
            })

            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
                expect(result.current.invoices[0].id).toBe(invoice.id)
            })

            await act(async () => {
                await result.current.confirmPayment(invoice)
            })

            expect(result.current.invoiceBeingPaid).toBeNull()
        })

        it('resets invoiceBeingPaid after confirmation fails', async () => {
            const invoice = makeInvoice({ paid: false })
            setupSinglePageHandler([invoice])
            mockConfirmInvoicePayment.mockRejectedValue(
                new Error('Payment failed'),
            )

            const { result } =
                renderHookWithQueryClientProvider(useInvoicePayment)

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            await act(async () => {
                await result.current.confirmPayment(invoice).catch(() => {})
            })

            expect(result.current.invoiceBeingPaid).toBeNull()
        })
    })
})
