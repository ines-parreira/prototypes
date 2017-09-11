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
                data: {
                    hello: 'world'
                },
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
            ).toEqualImmutable(
                fromJS(resp.data)
            )
        })

        it('receive meta', () => {
            const meta = {
                start_datetime: 'now'
            }

            const resp = {
                name: 'overview',
                data: {},
                meta,
            }

            expect(
                reducer(
                    initialState, {
                        type: types.FETCH_STATS_SUCCESS,
                        resp,
                    }
                ).getIn(['_internal', 'meta'])
            ).toEqualImmutable(
                fromJS(initialState.getIn(['_internal', 'meta']).merge(meta))
            )
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

        it('set filter', () => {
            const name = 'tags'
            const values = [1, 4]

            expect(
                reducer(
                    initialState, {
                        type: types.SET_STATS_FILTER,
                        name,
                        values,
                    }
                ).getIn(['_internal', 'filters'])
            ).toEqualImmutable(
                fromJS(initialState.getIn(['_internal', 'filters']).merge({
                    [name]: values
                }))
            )
        })
    })
})
