import {fromJS, Map} from 'immutable'
import * as immutableMatchers from 'jest-immutable-matchers'

import {StoreAction} from '../../types'
import * as types from '../constants'
import reducer, {initialState} from '../reducers'

jest.addMatchers(immutableMatchers)

const card = {
    brand: 'visa',
    last4: '4242',
    exp_month: 12,
    exp_year: 35,
}

const billingContact = {
    email: 'hello@acme.gorgias.io',
    shipping: {
        name: 'Gorgias',
        phone: '4155555556',
        address: {
            line1: '52 Washburn St',
            line2: '',
            city: 'San Francisco',
            state: 'CA',
            country: 'United States',
            postal_code: '94103',
        },
    },
}

describe('billing reducers', () => {
    it('initial state', () => {
        expect(reducer(undefined, {} as StoreAction)).toEqualImmutable(
            initialState
        )
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

        expect(
            reducer(initialState, {
                type: types.FETCH_INVOICES_SUCCESS,
                resp: invoices,
            })
        ).toMatchSnapshot()
    })

    describe('should update the billing contact information', () => {
        it('on successful contact fetch action', () => {
            expect(
                reducer(initialState, {
                    type: types.FETCH_BILLING_CONTACT_SUCCESS,
                    billingContact,
                })
            ).toMatchSnapshot()
        })

        it('on successful contact update action', () => {
            expect(
                reducer(initialState, {
                    type: types.UPDATE_BILLING_CONTACT_SUCCESS,
                    billingContact,
                })
            ).toMatchSnapshot()
        })
    })

    it('fetch credit card', () => {
        expect(
            reducer(initialState, {
                type: types.FETCH_CREDIT_CARD_SUCCESS,
                resp: card,
            })
        ).toMatchSnapshot()
    })

    it('update credit card', () => {
        expect(
            reducer(initialState, {
                type: types.UPDATE_CREDIT_CARD_SUCCESS,
                resp: card,
            })
        ).toMatchSnapshot()
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

        expect(
            reducer(initialState, {
                type: types.FETCH_CURRENT_USAGE_SUCCESS,
                resp: usage,
            })
        ).toMatchSnapshot()
    })

    describe('SET_CREDIT_CARD', () => {
        const creditCard = fromJS({
            last4: '1235',
            brand: 'visa',
            exp_month: '4',
            exp_year: '23',
            name: 'Steve',
        }) as Map<any, any>
        it('should set the credit card (initial state).', () => {
            const action = {
                type: types.SET_CREDIT_CARD,
                creditCard,
            }
            expect(reducer(initialState, action)).toMatchSnapshot()
        })

        it('should set the credit card and override the previous one.', () => {
            const action = {
                type: types.SET_CREDIT_CARD,
                creditCard,
            }
            const state = reducer(initialState, action)
            const newCreditCard = creditCard.merge({
                last4: '9583',
                name: 'Mark',
            })

            const newAction = {
                type: types.SET_CREDIT_CARD,
                creditCard: newCreditCard,
            }
            expect(reducer(state, newAction)).toMatchSnapshot()
        })
    })

    describe('UPDATE_INVOICE_IN_LIST', () => {
        it('should update an invoice in the list of invoices. (existing invoice)', () => {
            const invoices = [
                {
                    id: 'in_1',
                    paid: false,
                },
                {
                    id: 'in_2',
                    paid: false,
                },
            ]
            const state = initialState.set('invoices', fromJS(invoices))
            const action = {
                type: types.UPDATE_INVOICE_IN_LIST,
                invoice: fromJS({id: 'in_2', paid: true}),
            }
            expect(reducer(state, action)).toMatchSnapshot()
        })
    })
})
