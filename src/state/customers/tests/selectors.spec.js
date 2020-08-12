import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import * as selectors from '../selectors.ts'
import {initialState} from '../reducers.ts'

jest.addMatchers(immutableMatchers)

describe('customers selectors', () => {
    let state

    beforeEach(() => {
        state = {
            customers: initialState.mergeDeep({
                active: {id: 1},
                items: [{id: 1}, {id: 2}],
                _internal: {
                    loading: {
                        loader1: true,
                        loader2: false,
                    },
                },
            }),
        }
    })

    it('getCustomersState', () => {
        expect(selectors.getCustomersState(state)).toEqualImmutable(
            state.customers
        )
        expect(selectors.getCustomersState({})).toEqualImmutable(fromJS({}))
    })

    it('getLoading', () => {
        expect(selectors.getLoading(state)).toEqualImmutable(
            selectors.getCustomersState(state).getIn(['_internal', 'loading'])
        )
        expect(selectors.getLoading({})).toEqualImmutable(fromJS({}))
    })

    it('isLoading', () => {
        expect(selectors.isLoading('loader1')(state)).toBe(true)
        expect(selectors.isLoading('loader2')(state)).toBe(false)
        expect(selectors.isLoading('unknown')(state)).toBe(false)
    })

    it('getCustomers', () => {
        expect(selectors.getCustomers(state)).toEqualImmutable(
            selectors.getCustomersState(state).get('items')
        )
        expect(selectors.getCustomers({})).toEqualImmutable(fromJS([]))
    })

    it('getActiveCustomer', () => {
        expect(selectors.getActiveCustomer(state)).toEqualImmutable(
            selectors.getCustomersState(state).get('active')
        )
        expect(selectors.getActiveCustomer({})).toEqualImmutable(fromJS({}))
    })

    it('getActiveCustomerId', () => {
        expect(selectors.getActiveCustomerId(state)).toEqualImmutable(
            selectors.getCustomersState(state).getIn(['active', 'id'])
        )
        expect(selectors.getActiveCustomerId({})).toBe(undefined)
    })
})
