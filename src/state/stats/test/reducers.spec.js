import * as immutableMatchers from 'jest-immutable-matchers'

import {fromJS} from 'immutable'

import reducer, {initialState} from '../reducers'
import * as types from '../constants'

jest.addMatchers(immutableMatchers)

describe('reducers', () => {
    describe('stats', () => {
        it('initial state', () => {
            expect(
                reducer(
                    undefined,
                    {}
                )
            ).toEqualImmutable(initialState)
        })

        it('receive data', () => {
            const resp = {
                name: 'overview',
                data: [1, 2, 3],
                meta: {
                    start_datetime: 'now'
                }
            }

            expect(
                reducer(
                    initialState, {
                        type: types.FETCH_STATS_SUCCESS,
                        name:'overview',
                        resp,
                    }
                ).get('overview')
            ).toMatchSnapshot()
        })

        it('set meta', () => {
            const meta = {
                start_datetime: 'now'
            }

            expect(
                reducer(
                    initialState, {
                        type: types.SET_STATS_META,
                        meta,
                    }
                ).getIn(['_internal', 'meta'])
            ).toEqualImmutable(
                fromJS(initialState.getIn(['_internal', 'meta']).merge(meta))
            )
        })

        it('set filters', () => {
            const filters = {tags: [1, 5]}

            expect(
                reducer(
                    initialState, {
                        type: types.SET_STATS_FILTERS,
                        filters,
                    }
                ).getIn(['_internal', 'filters'])
            ).toEqualImmutable(
                fromJS(initialState.getIn(['_internal', 'filters']).merge({
                    tags: [1, 5]
                }))
            )
        })
    })
})
