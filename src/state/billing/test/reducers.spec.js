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
            const expectedState = initialState.set('currentUsage', fromJS(usage))
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
            const expectedState = initialState.set('invoices', fromJS(invoices))

            expect(reducer(initialState, action)).toEqualImmutable(expectedState)
        })

        it('should handle FETCH_CREDIT_CARD_SUCCESS', () => {
            const action = {
                type: types.FETCH_CREDIT_CARD_SUCCESS,
                resp: card
            }
            const expectedState = initialState.set('creditCard', fromJS(card))

            expect(reducer(initialState, action)).toEqualImmutable(expectedState)
        })

        it('should handle UPDATE_CREDIT_CARD_SUCCESS', () => {
            const action = {
                type: types.UPDATE_CREDIT_CARD_SUCCESS,
                resp: card
            }
            const expectedState = initialState.set('creditCard', fromJS(card))

            expect(reducer(initialState, action)).toEqualImmutable(expectedState)
        })
        it('should handle UPDATE_SUBSCRIPTION_SUCCESS', () => {
            const action = {
                type: types.UPDATE_SUBSCRIPTION_SUCCESS,
                resp: {
                    data: {
                        plan: 'plan'
                    }
                }
            }
            const expectedState = initialState.set('currentPlanId', 'plan')

            expect(reducer(initialState, action)).toEqualImmutable(expectedState)
        })
    })
})
