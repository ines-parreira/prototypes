import * as immutableMatchers from 'jest-immutable-matchers'

import {fromJS} from 'immutable'

import reducer, {initialState} from '../reducers'
import * as types from '../constants'

jest.addMatchers(immutableMatchers)

describe('reducers', () => {
    describe('stats', () => {
        it('initial state OK', () => {
            expect(
                reducer(
                    undefined,
                    {}
                )
            ).toEqualImmutable(initialState)
        })

        it('receive data OK', () => {
            const resp = {
                type: 'overview',
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
                        resp,
                    }
                ).get('overview')
            ).toEqualImmutable(
                fromJS(resp.data)
            )
        })

        it('receive meta OK', () => {
            const meta = {
                start_datetime: 'now'
            }

            const resp = {
                type: 'overview',
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

        it('set meta OK', () => {
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

        it('set filter OK', () => {
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
