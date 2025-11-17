import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { invoices } from 'fixtures/invoices'
import client from 'models/api/resources'
import type { Invoice } from 'state/billing/types'
import { PaymentIntentStatus, PaymentType } from 'state/billing/types'
import type { RootState, StoreDispatch } from 'state/types'

import PaymentsHistoryView from '../PaymentsHistoryView'

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

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
        mockPayInvoice.mockReturnValue(Promise.resolve())
        mockConfirmInvoicePayment.mockReturnValue(Promise.resolve())
    })

    it('renders loader when loading', () => {
        render(
            <Provider store={store}>
                <PaymentsHistoryView />
            </Provider>,
        )

        expect(screen.getByTestId('loader')).toBeInTheDocument()
    })

    it('renders invoices table when loaded', async () => {
        const { container } = render(
            <Provider store={store}>
                <PaymentsHistoryView />
            </Provider>,
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
            <Provider store={store}>
                <PaymentsHistoryView />
            </Provider>,
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
            <Provider store={store}>
                <PaymentsHistoryView />
            </Provider>,
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

        const { container } = render(
            <Provider store={store}>
                <PaymentsHistoryView />
            </Provider>,
        )

        await waitFor(() =>
            expect(container.querySelector('table')).toBeInTheDocument(),
        )

        fireEvent.click(screen.getByText('Retry Payment'))
        expect(mockPayInvoice).toBeCalledWith(invoices[0].id)
    })
})
