import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as types from '../constants'
import {fetchCurrentUsage, fetchInvoices, fetchCreditCard} from '../actions'
import {initialState} from '../reducers'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('actions', () => {
    describe('billing', () => {
        let store
        let mockServer

        beforeEach(() => {
            store = mockStore(initialState)
            mockServer = new MockAdapter(axios)
        })

        it('should fetch current usage', () => {
            const usage = {
                data: {
                    cost: 12.35,
                    ticket: 12323
                },
                meta: {
                    startDate: '2016-11-13T18:30:19+00:00',
                    endDate: '2016-12-13T18:30:19+00:00'
                }
            }
            const expectedActions = [{
                type: types.FETCH_CURRENT_USAGE_START
            }, {
                type: types.FETCH_CURRENT_USAGE_SUCCESS,
                resp: usage
            }]

            mockServer.onGet('/api/billing/current-usage/').reply(200, usage)

            return store.dispatch(fetchCurrentUsage()).then(() => {
                expect(store.getActions()).toEqual(expectedActions)
            })
        })

        it('should fetch invoices', () => {
            const invoices = [{
                metadata: {},
                paid: true,
                date: '2016-11-13T18:30:19+00:00',
                amount_due: 1234
            }]
            const expectedActions = [{
                type: types.FETCH_INVOICES_START
            }, {
                type: types.FETCH_INVOICES_SUCCESS,
                resp: invoices
            }]

            mockServer.onGet('/api/billing/invoices/').reply(200, {
                data: invoices
            })

            return store.dispatch(fetchInvoices()).then(() => {
                expect(store.getActions()).toEqual(expectedActions)
            })
        })

        it('should fetch credit card', () => {
            const card = {
                brand: 'visa',
                last4: '4242',
                exp_month: 12,
                exp_year: 35
            }
            const expectedActions = [{
                type: types.FETCH_CREDIT_CARD_START
            }, {
                type: types.FETCH_CREDIT_CARD_SUCCESS,
                resp: card
            }]

            mockServer.onGet('/api/billing/credit-card/').reply(200, card)

            return store.dispatch(fetchCreditCard()).then(() => {
                expect(store.getActions()).toEqual(expectedActions)
            })
        })
    })
})
