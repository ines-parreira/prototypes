import MockAdapter from 'axios-mock-adapter'
import {fromJS} from 'immutable'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'

import client from '../../../models/api/resources'
import {RootState, StoreDispatch} from '../../types'
import * as actions from '../actions'
import {initialState} from '../reducers'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('../../notifications/actions.ts', () => {
    return {
        notify: jest.fn(
            () =>
                <T>(args: T): T =>
                    args
        ),
    }
})

describe('billing actions', () => {
    let store: MockStoreEnhanced<Partial<RootState>, StoreDispatch>
    const mockServer = new MockAdapter(client)

    beforeEach(() => {
        store = mockStore({
            billing: initialState,
            currentUser: fromJS({id: 1}),
            currentAccount: fromJS({id: 1}),
        })
        mockServer.reset()
    })

    it('fetch current usage', () => {
        const usage = {
            data: {
                cost: 12.35,
                ticket: 12323,
            },
            meta: {
                startDate: '2016-11-13T18:30:19+00:00',
                endDate: '2016-12-13T18:30:19+00:00',
            },
        }

        mockServer.onGet('/api/billing/current-usage/').reply(200, usage)

        return store
            .dispatch(actions.fetchCurrentUsage())
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('fetch invoices', () => {
        const invoices = [
            {
                metadata: {},
                paid: true,
                date: '2016-11-13T18:30:19+00:00',
                amount_due: 1234,
            },
        ]

        mockServer.onGet('/api/billing/invoices/').reply(200, {data: invoices})

        return store
            .dispatch(actions.fetchInvoices())
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('fetch payment method', () => {
        const paymentMethod = {
            active: false,
            method: 'stripe',
        }

        mockServer
            .onGet('/api/billing/payment-method/')
            .reply(200, paymentMethod)

        return store
            .dispatch(actions.fetchPaymentMethod())
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('fetch credit card', () => {
        const card = {
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 35,
        }

        mockServer.onGet('/api/billing/credit-card/').reply(200, card)

        return store
            .dispatch(actions.fetchCreditCard())
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    describe('setCreditCard()', () => {
        it('should return a Redux action to set the credit card of the current account.', () => {
            const card = {
                last4: '6412',
                brand: 'mastercard',
                name: 'Steve Frizeli',
                exp_month: '12',
                exp_year: '24',
            }
            expect(actions.setCreditCard(fromJS(card))).toMatchSnapshot()
        })
    })

    describe('updateInvoiceInList()', () => {
        it('should return a Redux action to update an invoice in a list of invoices.', () => {
            const invoice = {
                id: 'in_dnu3xd0i2n3f0',
                paid: false,
            }
            expect(
                actions.updateInvoiceInList(fromJS(invoice))
            ).toMatchSnapshot()
        })
    })
})
