import React from 'react'
import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import {invoices} from 'fixtures/invoices'
import {RootState, StoreDispatch} from 'state/types'
import {Invoice, PaymentIntentStatus, PaymentType} from 'state/billing/types'
import client from 'models/api/resources'
import PaymentsHistoryView from '../PaymentsHistoryView'

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

const store = mockedStore({
    billing: fromJS({invoices, products: []}),
})

const mockPayInvoice = jest.fn()
const mockConfirmInvoicePayment = jest.fn()

jest.mock('services/gorgiasApi.ts', () => () => {
    return {
        payInvoice: mockPayInvoice,
        confirmInvoicePayment: mockConfirmInvoicePayment,
    }
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
            </Provider>
        )

        expect(screen.getByTestId('loader')).toBeInTheDocument()
    })

    it('renders invoices table when loaded', async () => {
        const {container} = render(
            <Provider store={store}>
                <PaymentsHistoryView />
            </Provider>
        )

        await waitFor(() =>
            expect(container.querySelector('table')).toBeInTheDocument()
        )
    })

    it('triggers retry payment when Retry Payment button is clicked', async () => {
        const apiMock = new MockAdapter(client)
        apiMock.onAny().reply(200, {})

        const invoice: Invoice = {
            description: 'Pro for the period from 2023-04-26 to 2023-04-28',
            invoice_pdf: '#',
            amount_due: 322052,
            payment_intent: {status: PaymentIntentStatus.RequiresSource},
            payment_confirmation_url: null,
            attempted: true,
            id: 'in_1N1DawI9qXomtXqStoF23sQ8',
            paid: false,
            date: 1682535698,
            metadata: {payment_service: PaymentType.Stripe},
        }

        const store = mockedStore({
            billing: fromJS({invoices: [invoice], products: []}),
        })

        const {container} = render(
            <Provider store={store}>
                <PaymentsHistoryView />
            </Provider>
        )

        await waitFor(() =>
            expect(container.querySelector('table')).toBeInTheDocument()
        )

        fireEvent.click(screen.getByText('Retry Payment'))
        expect(mockPayInvoice).toBeCalledWith(invoices[0].id)
    })
})
