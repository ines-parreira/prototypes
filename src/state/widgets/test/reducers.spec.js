import expect from 'expect'
import expectImmutable from 'expect-immutable'

import reducer, {initialState} from '../reducers'
import * as types from '../constants'

expect.extend(expectImmutable)

describe('reducers', () => {
    describe('widgets', () => {
        it('initial state OK', () => {
            expect(
                reducer(
                    undefined,
                    {}
                )
            ).toEqualImmutable(initialState)
        })

        it('fetch list OK', () => {
            const items = [{
                order: 0,
                type: 'card',
                title: 'Customer',
                path: '',
                widgets: []
            }, {
                order: 1,
                type: 'card',
                title: 'Orders',
                path: 'orders',
                widgets: []
            }]

            const expected = initialState
                .merge({
                    items
                })
                .setIn(['_internal', 'hasFetchedWidgets'], true)

            expect(
                reducer(
                    initialState, {
                        type: types.FETCH_WIDGETS_SUCCESS,
                        items
                    }
                )
            ).toEqualImmutable(expected)
        })
    })
})
