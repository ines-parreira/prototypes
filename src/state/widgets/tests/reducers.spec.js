import * as immutableMatchers from 'jest-immutable-matchers'

import reducer, {initialState} from '../reducers.ts'
import * as types from '../constants'

jest.addMatchers(immutableMatchers)

describe('reducers', () => {
    describe('widgets', () => {
        it('initial state', () => {
            expect(reducer(undefined, {})).toEqualImmutable(initialState)
        })

        it('fetch list', () => {
            const items = [
                {
                    order: 0,
                    type: 'card',
                    title: 'Customer',
                    path: '',
                    widgets: [],
                },
                {
                    order: 1,
                    type: 'card',
                    title: 'Orders',
                    path: 'orders',
                    widgets: [],
                },
            ]

            const expected = initialState
                .merge({
                    items,
                })
                .setIn(['_internal', 'hasFetchedWidgets'], true)

            expect(
                reducer(initialState, {
                    type: types.FETCH_WIDGETS_SUCCESS,
                    items,
                })
            ).toEqualImmutable(expected)
        })
    })
})
