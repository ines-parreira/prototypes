import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import * as selectors from '../selectors'
import {initialState} from '../reducers'

jest.addMatchers(immutableMatchers)

describe('infobar selectors', () => {
    let state

    beforeEach(() => {
        state = {
            infobar: initialState.mergeDeep(fromJS({
                _internal: {
                    loading: {}
                },
                picture: {
                    url: 'http://good.url',
                    email: 'alex@gorgias.io'
                },
                pendingActionsCallbacks: [{
                    callback: jest.fn(),
                    id: 'shopifyRefundShippingCostOfOrder-34-5-4194477515',
                }, {
                    callback: jest.fn(),
                    id: 'shopifyRefundShippingCostOfOrder-35-5-4194477515',
                }],
            })),
        }
    })

    it('getInfobarState', () => {
        expect(selectors.getInfobarState(state)).toEqualImmutable(state.infobar)
        expect(selectors.getInfobarState({})).toEqualImmutable(fromJS({}))
    })

    it('getPendingActionsCallbacks', () => {
        expect(selectors.getPendingActionsCallbacks(state)).toEqualImmutable(state.infobar.get('pendingActionsCallbacks'))
        expect(selectors.getPendingActionsCallbacks({})).toEqualImmutable(fromJS([]))
    })

    it('getPendingActionCallbacks', () => {
        expect(selectors.getPendingActionCallbacks('shopifyRefundShippingCostOfOrder-34-5-4194477515')(state)).toEqualImmutable(state.infobar.get('pendingActionsCallbacks').first())
        expect(selectors.getPendingActionCallbacks('unknown')(state)).toBe(undefined)
        expect(selectors.getPendingActionCallbacks('unknown')({})).toBe(undefined)
    })
})
