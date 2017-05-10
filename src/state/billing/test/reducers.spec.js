import * as immutableMatchers from 'jest-immutable-matchers'
import * as types from '../constants'
import reducer, {initialState} from '../reducers'
import {fromJS} from 'immutable'

jest.addMatchers(immutableMatchers)

const card = {
    brand: 'visa',
    last4: '4242',
    exp_month: 12,
    exp_year: 35
}

describe('reducers', () => {
    describe('billing', () => {
        it('should return the initial state', () => {
            expect(reducer(undefined, {})).toEqualImmutable(initialState)
        })

        it('should handle FETCH_CURRENT_USAGE_START', () => {
            const action = {
                type: types.FETCH_CURRENT_USAGE_START
            }
            const expectedState = initialState.setIn(['_internal', 'loading', 'fetchCurrentUsage'], true)

            expect(reducer(initialState, action)).toEqualImmutable(expectedState)
        })

        it('should handle FETCH_CURRENT_USAGE_ERROR', () => {
            const action = {
                type: types.FETCH_CURRENT_USAGE_ERROR
            }
            const expectedState = initialState.setIn(['_internal', 'loading', 'fetchCurrentUsage'], false)

            expect(reducer(initialState, action)).toEqualImmutable(expectedState)
        })

        it('should handle FETCH_CURRENT_USAGE_SUCCESS', () => {
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
            const action = {
                type: types.FETCH_CURRENT_USAGE_SUCCESS,
                resp: usage
            }
            const expectedState = initialState.setIn(['_internal', 'loading', 'fetchCurrentUsage'], false)
            .set('currentUsage', fromJS(usage))

            expect(reducer(initialState, action)).toEqualImmutable(expectedState)
        })

        it('should handle FETCH_INVOICES_START', () => {
            const action = {
                type: types.FETCH_INVOICES_START
            }
            const expectedState = initialState.setIn(['_internal', 'loading', 'fetchInvoices'], true)

            expect(reducer(initialState, action)).toEqualImmutable(expectedState)
        })

        it('should handle FETCH_INVOICES_ERROR', () => {
            const action = {
                type: types.FETCH_INVOICES_ERROR
            }
            const expectedState = initialState.setIn(['_internal', 'loading', 'fetchInvoices'], false)

            expect(reducer(initialState, action)).toEqualImmutable(expectedState)
        })

        it('should handle FETCH_INVOICES_SUCCESS', () => {
            const invoices = [{
                metadata: {},
                paid: true,
                date: '2016-11-13T18:30:19+00:00',
                amount_due: 1234
            }]
            const action = {
                type: types.FETCH_INVOICES_SUCCESS,
                resp: invoices
            }
            const expectedState = initialState.setIn(['_internal', 'loading', 'fetchInvoices'], false)
                .set('invoices', fromJS(invoices))

            expect(reducer(initialState, action)).toEqualImmutable(expectedState)
        })

        it('should handle FETCH_CREDIT_CARD_START', () => {
            const action = {
                type: types.FETCH_CREDIT_CARD_START
            }
            const expectedState = initialState.setIn(['_internal', 'loading', 'fetchCreditCard'], true)

            expect(reducer(initialState, action)).toEqualImmutable(expectedState)
        })

        it('should handle FETCH_CREDIT_CARD_ERROR', () => {
            const action = {
                type: types.FETCH_CREDIT_CARD_ERROR
            }
            const expectedState = initialState.setIn(['_internal', 'loading', 'fetchCreditCard'], false)

            expect(reducer(initialState, action)).toEqualImmutable(expectedState)
        })

        it('should handle FETCH_CREDIT_CARD_SUCCESS', () => {
            const action = {
                type: types.FETCH_CREDIT_CARD_SUCCESS,
                resp: card
            }
            const expectedState = initialState.setIn(['_internal', 'loading', 'fetchCreditCard'], false)
                .set('creditCard', fromJS(card))

            expect(reducer(initialState, action)).toEqualImmutable(expectedState)
        })

        it('should handle UPDATE_CREDIT_CARD_START', () => {
            const action = {
                type: types.UPDATE_CREDIT_CARD_START
            }
            const expectedState = initialState.setIn(['_internal', 'loading', 'updateCreditCard'], true)

            expect(reducer(initialState, action)).toEqualImmutable(expectedState)
        })

        it('should handle UPDATE_CREDIT_CARD_ERROR', () => {
            const action = {
                type: types.UPDATE_CREDIT_CARD_ERROR
            }
            const expectedState = initialState.setIn(['_internal', 'loading', 'updateCreditCard'], false)

            expect(reducer(initialState, action)).toEqualImmutable(expectedState)
        })

        it('should handle UPDATE_CREDIT_CARD_SUCCESS', () => {
            const action = {
                type: types.UPDATE_CREDIT_CARD_SUCCESS,
                resp: card
            }
            const expectedState = initialState.setIn(['_internal', 'loading', 'updateCreditCard'], false)
                .set('creditCard', fromJS(card))

            expect(reducer(initialState, action)).toEqualImmutable(expectedState)
        })
    })
})
