import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { baseInvoice } from 'pages/settings/new_billing/fixtures'
import type { Invoice } from 'state/billing/types'
import { PaymentIntentStatus } from 'state/billing/types'

import { PaymentHistoryTable } from '../PaymentHistoryTable'

const defaultProps = {
    invoices: [baseInvoice],
    isLoading: false,
    invoiceBeingPaid: null as Invoice | null,
    confirmPayment: jest.fn(),
    retryPayment: jest.fn(),
    hasNextPage: false,
    hasPrevPage: false,
    onNextPage: jest.fn(),
    onPrevPage: jest.fn(),
}

const renderTable = async (props: Partial<typeof defaultProps> = {}) => {
    const result = render(<PaymentHistoryTable {...defaultProps} {...props} />)
    await act(async () => {})
    return result
}

describe('PaymentHistoryTable', () => {
    describe('column headers', () => {
        it('renders all column headers', async () => {
            await renderTable()

            expect(screen.getByText('Date')).toBeInTheDocument()
            expect(screen.getByText('Amount')).toBeInTheDocument()
            expect(screen.getByText('Amount Due')).toBeInTheDocument()
            expect(screen.getByText('Amount Paid')).toBeInTheDocument()
            expect(screen.getByText('Description')).toBeInTheDocument()
            expect(screen.getByText('Status')).toBeInTheDocument()
            expect(screen.getByText('Actions')).toBeInTheDocument()
        })
    })

    describe('cell rendering', () => {
        it('renders formatted date in Date column', async () => {
            await renderTable()

            expect(screen.getByText('April 26, 2023')).toBeInTheDocument()
        })

        it('renders formatted total in Amount column', async () => {
            await renderTable({ invoices: [{ ...baseInvoice, total: 500000 }] })

            expect(screen.getByText('$5,000')).toBeInTheDocument()
        })

        it('renders formatted amount_due in Amount Due column', async () => {
            await renderTable({
                invoices: [{ ...baseInvoice, amount_due: 322052 }],
            })

            expect(screen.getByText('$3,220.52')).toBeInTheDocument()
        })

        it('renders formatted amount_paid in Amount Paid column', async () => {
            await renderTable({
                invoices: [{ ...baseInvoice, amount_paid: 150000 }],
            })

            expect(screen.getByText('$1,500')).toBeInTheDocument()
        })

        it('renders description text in Description column', async () => {
            await renderTable()

            expect(screen.getByText('Pro plan for 2023-04')).toBeInTheDocument()
        })

        it('renders Paid badge when invoice is paid', async () => {
            await renderTable({ invoices: [{ ...baseInvoice, paid: true }] })

            expect(screen.getByText('Paid')).toBeInTheDocument()
            expect(screen.queryByText('Unpaid')).not.toBeInTheDocument()
        })

        it('renders Unpaid badge when invoice is not paid', async () => {
            await renderTable({
                invoices: [
                    {
                        ...baseInvoice,
                        paid: false,
                        payment_intent: {
                            status: PaymentIntentStatus.Succeeded,
                        },
                    },
                ],
            })

            expect(screen.getByText('Unpaid')).toBeInTheDocument()
            expect(screen.queryByText('Paid')).not.toBeInTheDocument()
        })

        it('renders Download PDF link with correct href', async () => {
            await renderTable()

            const link = screen.getByRole('link', { name: /download pdf/i })
            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute(
                'href',
                'https://example.com/invoice.pdf',
            )
        })

        it('renders Download PDF link with target="_blank"', async () => {
            await renderTable()

            const link = screen.getByRole('link', { name: /download pdf/i })
            expect(link).toHaveAttribute('target', '_blank')
        })
    })

    describe('actions column', () => {
        it('does not render Confirm button when status is not RequiresConfirmation', async () => {
            await renderTable({
                invoices: [
                    {
                        ...baseInvoice,
                        payment_intent: {
                            status: PaymentIntentStatus.Succeeded,
                        },
                    },
                ],
            })

            expect(
                screen.queryByRole('button', { name: /confirm/i }),
            ).not.toBeInTheDocument()
        })

        it('renders Confirm button when payment_intent status is RequiresConfirmation', async () => {
            await renderTable({
                invoices: [
                    {
                        ...baseInvoice,
                        paid: false,
                        payment_intent: {
                            status: PaymentIntentStatus.RequiresConfirmation,
                        },
                    },
                ],
            })

            expect(
                screen.getByRole('button', { name: /confirm/i }),
            ).toBeInTheDocument()
        })

        it('renders Retry Payment button when status is RequiresSource and invoice is unpaid', async () => {
            await renderTable({
                invoices: [
                    {
                        ...baseInvoice,
                        paid: false,
                        payment_intent: {
                            status: PaymentIntentStatus.RequiresSource,
                        },
                    },
                ],
            })

            expect(
                screen.getByRole('button', { name: /retry payment/i }),
            ).toBeInTheDocument()
        })

        it('renders Retry Payment button when status is RequiresPaymentMethod and invoice is unpaid', async () => {
            await renderTable({
                invoices: [
                    {
                        ...baseInvoice,
                        paid: false,
                        payment_intent: {
                            status: PaymentIntentStatus.RequiresPaymentMethod,
                        },
                    },
                ],
            })

            expect(
                screen.getByRole('button', { name: /retry payment/i }),
            ).toBeInTheDocument()
        })

        it('does not render Retry Payment button when invoice is paid', async () => {
            await renderTable({
                invoices: [
                    {
                        ...baseInvoice,
                        paid: true,
                        payment_intent: {
                            status: PaymentIntentStatus.RequiresSource,
                        },
                    },
                ],
            })

            expect(
                screen.queryByRole('button', { name: /retry payment/i }),
            ).not.toBeInTheDocument()
        })

        it('does not render Retry Payment button when has_payment_schedules is true', async () => {
            await renderTable({
                invoices: [
                    {
                        ...baseInvoice,
                        paid: false,
                        has_payment_schedules: true,
                        payment_intent: {
                            status: PaymentIntentStatus.RequiresPaymentMethod,
                        },
                    },
                ],
            })

            expect(
                screen.queryByRole('button', { name: /retry payment/i }),
            ).not.toBeInTheDocument()
        })

        it('calls confirmPayment with the invoice when Confirm button is clicked', async () => {
            const confirmPayment = jest.fn()
            const user = userEvent.setup()
            const invoice = {
                ...baseInvoice,
                paid: false,
                payment_intent: {
                    status: PaymentIntentStatus.RequiresConfirmation,
                },
            }

            await renderTable({ invoices: [invoice], confirmPayment })

            await act(() =>
                user.click(screen.getByRole('button', { name: /confirm/i })),
            )

            expect(confirmPayment).toHaveBeenCalledWith(invoice)
        })

        it('calls retryPayment with the invoice when Retry Payment button is clicked', async () => {
            const retryPayment = jest.fn()
            const user = userEvent.setup()
            const invoice = {
                ...baseInvoice,
                paid: false,
                payment_intent: { status: PaymentIntentStatus.RequiresSource },
            }

            await renderTable({ invoices: [invoice], retryPayment })

            await act(() =>
                user.click(
                    screen.getByRole('button', { name: /retry payment/i }),
                ),
            )

            expect(retryPayment).toHaveBeenCalledWith(invoice)
        })

        it('shows Confirm button in loading state when invoiceBeingPaid matches the invoice', async () => {
            const invoice = {
                ...baseInvoice,
                paid: false,
                payment_intent: {
                    status: PaymentIntentStatus.RequiresConfirmation,
                },
            }

            await renderTable({
                invoices: [invoice],
                invoiceBeingPaid: invoice,
            })

            expect(
                screen.getByRole('button', { name: /confirm/i }),
            ).toBeInTheDocument()
        })

        it('shows Retry Payment button in loading state when invoiceBeingPaid matches the invoice', async () => {
            const invoice = {
                ...baseInvoice,
                paid: false,
                payment_intent: { status: PaymentIntentStatus.RequiresSource },
            }

            await renderTable({
                invoices: [invoice],
                invoiceBeingPaid: invoice,
            })

            expect(
                screen.getByRole('button', { name: /retry payment/i }),
            ).toBeInTheDocument()
        })
    })

    describe('pagination', () => {
        it('does not render pagination controls when hasNextPage and hasPrevPage are both false', async () => {
            await renderTable({ hasNextPage: false, hasPrevPage: false })

            expect(
                screen.queryByRole('button', { name: /previous/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /next/i }),
            ).not.toBeInTheDocument()
        })

        it('renders pagination controls when hasNextPage is true', async () => {
            await renderTable({ hasNextPage: true, hasPrevPage: false })

            expect(
                screen.getByRole('button', { name: /previous/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /next/i }),
            ).toBeInTheDocument()
        })

        it('renders pagination controls when hasPrevPage is true', async () => {
            await renderTable({ hasNextPage: false, hasPrevPage: true })

            expect(
                screen.getByRole('button', { name: /previous/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /next/i }),
            ).toBeInTheDocument()
        })

        it('disables Previous button when hasPrevPage is false', async () => {
            await renderTable({ hasNextPage: true, hasPrevPage: false })

            expect(
                screen.getByRole('button', { name: /previous/i }),
            ).toHaveAttribute('aria-disabled', 'true')
        })

        it('disables Next button when hasNextPage is false', async () => {
            await renderTable({ hasNextPage: false, hasPrevPage: true })

            expect(
                screen.getByRole('button', { name: /next/i }),
            ).toHaveAttribute('aria-disabled', 'true')
        })

        it('enables Previous button when hasPrevPage is true', async () => {
            await renderTable({ hasNextPage: false, hasPrevPage: true })

            expect(
                screen.getByRole('button', { name: /previous/i }),
            ).not.toHaveAttribute('aria-disabled', 'true')
        })

        it('enables Next button when hasNextPage is true', async () => {
            await renderTable({ hasNextPage: true, hasPrevPage: false })

            expect(
                screen.getByRole('button', { name: /next/i }),
            ).not.toHaveAttribute('aria-disabled', 'true')
        })

        it('calls onPrevPage when Previous button is clicked', async () => {
            const onPrevPage = jest.fn()
            const user = userEvent.setup()

            await renderTable({
                hasNextPage: false,
                hasPrevPage: true,
                onPrevPage,
            })

            await act(() =>
                user.click(screen.getByRole('button', { name: /previous/i })),
            )

            expect(onPrevPage).toHaveBeenCalledTimes(1)
        })

        it('calls onNextPage when Next button is clicked', async () => {
            const onNextPage = jest.fn()
            const user = userEvent.setup()

            await renderTable({
                hasNextPage: true,
                hasPrevPage: false,
                onNextPage,
            })

            await act(() =>
                user.click(screen.getByRole('button', { name: /next/i })),
            )

            expect(onNextPage).toHaveBeenCalledTimes(1)
        })

        it('shows the correct item count in the pagination toolbar', async () => {
            await renderTable({
                invoices: [baseInvoice, { ...baseInvoice, id: 'inv_002' }],
                hasNextPage: true,
            })

            expect(screen.getByText('2 items')).toBeInTheDocument()
        })
    })

    describe('loading state', () => {
        it('renders table structure when in loading state', async () => {
            await renderTable({ isLoading: true, invoices: [] })

            expect(screen.getByRole('table')).toBeInTheDocument()
        })

        it('renders table structure with empty invoices', async () => {
            await renderTable({ invoices: [] })

            expect(screen.getByRole('table')).toBeInTheDocument()
        })
    })

    describe('multiple invoices', () => {
        it('renders a row for each invoice', async () => {
            const invoices = [
                { ...baseInvoice, id: 'inv_001', description: 'Invoice one' },
                { ...baseInvoice, id: 'inv_002', description: 'Invoice two' },
                { ...baseInvoice, id: 'inv_003', description: 'Invoice three' },
            ]

            await renderTable({ invoices })

            expect(screen.getByText('Invoice one')).toBeInTheDocument()
            expect(screen.getByText('Invoice two')).toBeInTheDocument()
            expect(screen.getByText('Invoice three')).toBeInTheDocument()
        })
    })
})
