import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import { currentProductsUsage } from 'fixtures/plans'
import type { StoreAction } from 'state/types'

import * as types from '../constants'
import reducer, { initialState } from '../reducers'

const card = {
    brand: 'visa',
    last4: '4242',
    exp_month: 12,
    exp_year: 35,
}

describe('billing reducers', () => {
    it('initial state', () => {
        expect(reducer(undefined, {} as StoreAction)).toEqualImmutable(
            initialState,
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
            }),
        ).toMatchSnapshot()
    })

    it('fetch credit card', () => {
        expect(
            reducer(initialState, {
                type: types.FETCH_CREDIT_CARD_SUCCESS,
                resp: card,
            }),
        ).toMatchSnapshot()
    })

    it('update credit card', () => {
        expect(
            reducer(initialState, {
                type: types.UPDATE_CREDIT_CARD_SUCCESS,
                resp: card,
            }),
        ).toMatchSnapshot()
    })

    it('fetch current products usage', () => {
        expect(
            reducer(initialState, {
                type: types.FETCH_CURRENT_PRODUCTS_USAGE_SUCCESS,
                resp: currentProductsUsage,
            }),
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
                invoice: fromJS({ id: 'in_2', paid: true }),
            }
            expect(reducer(state, action)).toMatchSnapshot()
        })
    })
})
