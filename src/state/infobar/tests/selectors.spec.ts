import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS, List} from 'immutable'

import {RootState} from '../../types'
import * as selectors from '../selectors'
import {initialState} from '../reducers'

jest.addMatchers(immutableMatchers)

describe('infobar selectors', () => {
    let state: RootState

    beforeEach(() => {
        state = {
            infobar: initialState.mergeDeep(
                fromJS({
                    _internal: {
                        loading: {},
                    },
                    picture: {
                        url: 'http://good.url',
                        email: 'alex@gorgias.io',
                    },
                    pendingActionsCallbacks: [
                        {
                            callback: jest.fn(),
                            id: 'shopifyRefundShippingCostOfOrder-34-5-4194477515',
                        },
                        {
                            callback: jest.fn(),
                            id: 'shopifyRefundShippingCostOfOrder-35-5-4194477515',
                        },
                    ],
                })
            ),
        } as RootState
    })

    it('getInfobarState', () => {
        expect(selectors.getInfobarState(state)).toEqualImmutable(state.infobar)
        expect(selectors.getInfobarState({} as RootState)).toEqualImmutable(
            fromJS({})
        )
    })

    it('getPendingActionsCallbacks', () => {
        expect(selectors.getPendingActionsCallbacks(state)).toEqualImmutable(
            state.infobar.get('pendingActionsCallbacks')
        )
        expect(
            selectors.getPendingActionsCallbacks({} as RootState)
        ).toEqualImmutable(fromJS([]))
    })

    it('getPendingActionCallbacks', () => {
        expect(
            selectors.getPendingActionCallbacks(state)(
                'shopifyRefundShippingCostOfOrder-34-5-4194477515'
            )
        ).toEqualImmutable(
            (state.infobar.get('pendingActionsCallbacks') as List<any>).first()
        )
        expect(selectors.getPendingActionCallbacks(state)('unknown')).toBe(
            undefined
        )
        expect(
            selectors.getPendingActionCallbacks({} as RootState)('unknown')
        ).toBe(undefined)
    })
})
