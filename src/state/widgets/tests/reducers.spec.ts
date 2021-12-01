import * as immutableMatchers from 'jest-immutable-matchers'

import {GorgiasAction} from '../../types'
import * as types from '../constants'
import reducer, {initialState} from '../reducers'
import {Widget} from '../types'

jest.addMatchers(immutableMatchers)

describe('reducers', () => {
    describe('widgets', () => {
        it('initial state', () => {
            expect(reducer(undefined, {} as GorgiasAction)).toEqualImmutable(
                initialState
            )
        })

        it('fetch list', () => {
            const items = [
                {
                    order: 0,
                    type: 'card',
                    title: 'Customer',
                    path: '',
                    widgets: [],
                } as unknown as Widget,
                {
                    order: 1,
                    type: 'card',
                    title: 'Orders',
                    path: 'orders',
                    widgets: [],
                } as unknown as Widget,
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
