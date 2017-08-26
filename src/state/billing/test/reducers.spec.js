import * as immutableMatchers from 'jest-immutable-matchers'

import * as types from '../constants'
import reducer, {initialState} from '../reducers'

jest.addMatchers(immutableMatchers)

const card = {
    brand: 'visa',
    last4: '4242',
    exp_month: 12,
    exp_year: 35
}

describe('billing reducers', () => {
    it('initial state', () => {
        expect(reducer(undefined, {})).toEqualImmutable(initialState)
    })

    it('fetch invoices', () => {
        const invoices = [{
            metadata: {},
            paid: true,
            date: '2016-11-13T18:30:19+00:00',
            amount_due: 1234
        }]

        expect(
            reducer(
                initialState, {
                    type: types.FETCH_INVOICES_SUCCESS,
                    resp: invoices,
                }
            )
        ).toMatchSnapshot()
    })

    it('fetch credit card', () => {
        expect(
            reducer(
                initialState, {
                    type: types.FETCH_CREDIT_CARD_SUCCESS,
                    resp: card,
                }
            )
        ).toMatchSnapshot()
    })

    it('update credit card', () => {
        expect(
            reducer(
                initialState, {
                    type: types.UPDATE_CREDIT_CARD_SUCCESS,
                    resp: card,
                }
            )
        ).toMatchSnapshot()
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

        expect(
            reducer(
                initialState, {
                    type: types.FETCH_CURRENT_USAGE_SUCCESS,
                    resp: usage,
                }
            )
        ).toMatchSnapshot()
    })

    it('update subscription', () => {
        const subscription = {
            data: {
                plan: 'plan'
            }
        }

        expect(
            reducer(
                initialState, {
                    type: types.FETCH_CURRENT_USAGE_SUCCESS,
                    resp: subscription,
                }
            )
        ).toMatchSnapshot()
    })
})
