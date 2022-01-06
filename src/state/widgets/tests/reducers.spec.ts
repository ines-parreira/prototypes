import * as immutableMatchers from 'jest-immutable-matchers'

import {fromJS} from 'immutable'
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

    describe('custom actions edition', () => {
        it('set the data correctly', () => {
            const data = [
                {
                    label: 'anything',
                },
                {
                    data: {
                        works: 'too',
                    },
                },
            ]
            const currentState = initialState.setIn(
                ['_internal', 'currentlyEditedWidgetPath'],
                '0.meta.custom.links'
            )

            const expectedState = currentState
                .setIn(
                    ['_internal', 'editedItems'].concat(
                        '0.meta.custom.links'.split('.')
                    ),
                    fromJS(data)
                )
                .setIn(['_internal', 'isDirty'], true)

            expect(
                reducer(currentState, {
                    type: types.UPDATE_CUSTOM_ACTION,
                    data,
                })
            ).toEqualImmutable(expectedState)
        })
    })
})
