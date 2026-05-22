import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import type { Invoice } from 'state/billing/types'
import { ReactivationInvoiceList } from './ReactivationInvoiceList'

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
    return {
        id: 'inv_001',
        invoice_pdf: 'https://example.com/inv_001.pdf',
        total: 5100,
        amount_paid: 1275,
        amount_due: 3825,
        paid: false,
        attempted: false,
        date: 1704067200,
        description: null,
        metadata: { payment_service: 'stripe' } as Invoice['metadata'],
        payment_confirmation_url: null,
        payment_intent: { status: 'succeeded' } as Invoice['payment_intent'],
        ...overrides,
    }
}

function renderComponent(
    overrides: Partial<Parameters<typeof ReactivationInvoiceList>[0]> = {},
) {
    const props = {
        invoices: [makeInvoice()],
        currency: 'usd',
        ...overrides,
    }
    return render(<ReactivationInvoiceList {...props} />)
}

describe('ReactivationInvoiceList', () => {
    it('renders the warning banner', () => {
        renderComponent()

        expect(
            screen.getByText(
                /non-paid invoices in your current term that may be invoiced when reactivating/i,
            ),
        ).toBeInTheDocument()
    })

    it('renders the "Invoices to pay" heading', () => {
        renderComponent()

        expect(screen.getByText('Invoices to pay')).toBeInTheDocument()
    })

    it('renders all column headers', () => {
        renderComponent()

        expect(screen.getByText('INVOICE')).toBeInTheDocument()
        expect(screen.getByText('TOTAL')).toBeInTheDocument()
        expect(screen.getByText('PAID')).toBeInTheDocument()
        expect(screen.getByText('DUE')).toBeInTheDocument()
        expect(screen.getByText('STATUS')).toBeInTheDocument()
    })

    it('renders the invoice id as a link to the PDF', () => {
        renderComponent()

        const link = screen.getByRole('link', { name: 'inv_001' })
        expect(link).toHaveAttribute('href', 'https://example.com/inv_001.pdf')
        expect(link).toHaveAttribute('target', '_blank')
    })

    it('renders formatted amounts converted from cents', () => {
        renderComponent({
            invoices: [
                makeInvoice({
                    total: 5100,
                    amount_paid: 1275,
                    amount_due: 3825,
                }),
            ],
        })

        expect(screen.getByText('$51')).toBeInTheDocument()
        expect(screen.getByText('$12.75')).toBeInTheDocument()
        expect(screen.getByText('$38.25')).toBeInTheDocument()
    })

    it('shows "Unpaid" status for an unpaid invoice', () => {
        renderComponent({ invoices: [makeInvoice({ paid: false })] })

        expect(screen.getByText('Unpaid')).toBeInTheDocument()
        expect(screen.queryByText('Paid')).not.toBeInTheDocument()
    })

    it('shows "Paid" status for a paid invoice', () => {
        renderComponent({
            invoices: [
                makeInvoice({ paid: true, amount_due: 0, amount_paid: 5100 }),
            ],
        })

        expect(screen.getByText('Paid')).toBeInTheDocument()
        expect(screen.queryByText('Unpaid')).not.toBeInTheDocument()
    })

    it('renders multiple invoices with their own ids and amounts', () => {
        renderComponent({
            invoices: [
                makeInvoice({
                    id: 'inv_001',
                    invoice_pdf: 'https://example.com/inv_001.pdf',
                    total: 5100,
                    amount_paid: 1275,
                    amount_due: 3825,
                    paid: false,
                }),
                makeInvoice({
                    id: 'inv_002',
                    invoice_pdf: 'https://example.com/inv_002.pdf',
                    total: 2550,
                    amount_paid: 2550,
                    amount_due: 0,
                    paid: true,
                }),
            ],
        })

        expect(screen.getByRole('link', { name: 'inv_001' })).toHaveAttribute(
            'href',
            'https://example.com/inv_001.pdf',
        )
        expect(screen.getByRole('link', { name: 'inv_002' })).toHaveAttribute(
            'href',
            'https://example.com/inv_002.pdf',
        )
        expect(screen.getByText('Unpaid')).toBeInTheDocument()
        expect(screen.getByText('Paid')).toBeInTheDocument()
    })

    it('formats amounts using the provided currency', () => {
        renderComponent({
            invoices: [
                makeInvoice({
                    total: 5100,
                    amount_paid: 1275,
                    amount_due: 3825,
                }),
            ],
            currency: 'eur',
        })

        expect(screen.getByText('€51')).toBeInTheDocument()
        expect(screen.getByText('€12.75')).toBeInTheDocument()
        expect(screen.getByText('€38.25')).toBeInTheDocument()
    })
})
