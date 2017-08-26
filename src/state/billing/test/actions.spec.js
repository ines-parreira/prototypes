import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import * as actions from '../actions'
import {initialState} from '../reducers'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.mock('../../notifications/actions', () => {
    return {
        notify: jest.fn(() => (args) => args),
    }
})

jest.mock('react-router', () => {
    const reactRouter = require.requireActual('react-router')

    return {
        ...reactRouter,
        browserHistory: {
            push: jest.fn(),
        },
    }
})

describe('billing actions', () => {
    let store
    let mockServer

    beforeEach(() => {
        store = mockStore({billing: initialState})
        mockServer = new MockAdapter(axios)
    })

    it('fetch current usage', () => {
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

        mockServer.onGet('/api/billing/current-usage/').reply(200, usage)

        return store.dispatch(actions.fetchCurrentUsage())
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('fetch invoices', () => {
        const invoices = [{
            metadata: {},
            paid: true,
            date: '2016-11-13T18:30:19+00:00',
            amount_due: 1234
        }]

        mockServer.onGet('/api/billing/invoices/').reply(200, {data: invoices})

        return store.dispatch(actions.fetchInvoices())
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('fetch payment method', () => {
        const paymentMethod = {
            active: false,
            method: 'stripe',
        }

        mockServer.onGet('/api/billing/payment-method/').reply(200, paymentMethod)

        return store.dispatch(actions.fetchPaymentMethod())
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('fetch credit card', () => {
        const card = {
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 35
        }

        mockServer.onGet('/api/billing/credit-card/').reply(200, card)

        return store.dispatch(actions.fetchCreditCard())
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    describe('update credit card', () => {
        it('success', () => {
            const card = {
                name: 'Alex',
                number: '545454545454',
                expDate: '10/23',
                cvc: '123',
            }

            window.Stripe = {
                card: {
                    createToken: jest.fn((data, callback) => {
                        expect(data).toHaveProperty('name', 'Alex')
                        expect(data).toHaveProperty('number', '545454545454')
                        expect(data).toHaveProperty('cvc', '123')
                        expect(data).toHaveProperty('exp_month', '10')
                        expect(data).toHaveProperty('exp_year', '23')

                        // trigger success
                        callback('success', {
                            id: 1234,
                        })
                    }),
                },
            }

            mockServer.onPut('/api/billing/credit-card/').reply(200, card)

            return store.dispatch(actions.updateCreditCard(card))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('Stripe error', () => {
            const card = {
                name: 'Alex',
                number: '545454545454',
                expDate: '10/23',
                cvc: '123',
            }

            window.Stripe = {
                card: {
                    createToken: jest.fn((data, callback) => {
                        expect(data).toHaveProperty('name', 'Alex')
                        expect(data).toHaveProperty('number', '545454545454')
                        expect(data).toHaveProperty('cvc', '123')
                        expect(data).toHaveProperty('exp_month', '10')
                        expect(data).toHaveProperty('exp_year', '23')

                        // trigger error
                        callback('error', {
                            error: 'Sorry you can only buy ice cream with this credit card',
                        })
                    }),
                },
            }

            mockServer.onPut('/api/billing/credit-card/').reply(200, card)

            return store.dispatch(actions.updateCreditCard(card))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('fails because no Stripe', () => {
            window.Stripe = undefined

            store.dispatch(actions.updateCreditCard({}))
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    it('update subscription', () => {
        const subscription = {
            plan: 'basic',
        }

        mockServer.onPut('/api/billing/subscription/').reply(200, subscription)

        return store.dispatch(actions.updateSubscription())
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })
})
