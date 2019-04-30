import * as immutableMatchers from 'jest-immutable-matchers'

import {fromJS} from 'immutable'

import reducer, {initialState} from '../reducers'
import * as types from '../constants'
import {setFilters} from '../actions'
import {getHashOfObj} from '../../../utils'

jest.addMatchers(immutableMatchers)

describe('reducers', () => {
    describe('stats', () => {
        it('should set the initial state', () => {
            expect(
                reducer(
                    undefined,
                    {}
                )
            ).toEqualImmutable(initialState)
        })

        it('should set a statistic because filters used to fetch the statistic do not need to match current filters', () => {
            const filters = fromJS({tags: [1, 2]})
            const stat = {
                name: 'overview',
                data: {
                    data: {
                        delta: 4100,
                        name: 'total_new_tickets',
                        type: 'number',
                        value: 42,
                    },
                    legend: {
                        x: '',
                        y: 'Total new tickets'
                    }
                },
                meta: {
                    start_datetime: 'now'
                }
            }
            const action = {
                type: types.FETCH_STATS_SUCCESS,
                name: stat.name,
                shouldMatchCurrentFilters: false,
                stat
            }
            let state = reducer(initialState, setFilters(filters))

            state = reducer(state, action)
            expect(state.get(stat.name)).toMatchSnapshot()
        })

        it('should set a statistic because the filters used to fetch the statistic match the current filters', () => {
            const filters = fromJS({tags: [1, 2]})
            const stat = {
                name: 'overview',
                data: {
                    data: {
                        delta: 4100,
                        name: 'total_new_tickets',
                        type: 'number',
                        value: 42,
                    },
                    legend: {
                        x: '',
                        y: 'Total new tickets'
                    }
                },
                meta: {
                    start_datetime: 'now'
                }
            }
            const action = {
                type: types.FETCH_STATS_SUCCESS,
                name: stat.name,
                shouldMatchCurrentFilters: true,
                filtersHash: getHashOfObj(filters.toJS()),
                stat
            }
            let state = reducer(initialState, setFilters(filters))

            state = reducer(state, action)
            expect(state.get(stat.name)).toMatchSnapshot()
        })

        it('should not set a statistic because the filters used to fetch the statistic ' +
            'do not match the current filters', () => {
            const filters = fromJS({tags: [1, 2]})
            const stat = {
                name: 'overview',
                data: [1, 2, 3],
                meta: {
                    start_datetime: 'now'
                }
            }
            const action = {
                type: types.FETCH_STATS_SUCCESS,
                name: stat.name,
                shouldMatchCurrentFilters: true,
                filtersHash: 'a-different-filters-hash',
                stat
            }
            let state = reducer(initialState, setFilters(filters))

            state = reducer(state, action)
            expect(state.get(stat.name)).toEqual(undefined)
        })

        it('should set filters', () => {
            const filtersPath = ['_internal', 'filters']
            const action = {
                type: types.SET_STATS_FILTERS,
                filters: fromJS({tags: [1, 5]})
            }
            const state = reducer(initialState, action)
            const expectedState = initialState.setIn(['_internal', 'filters'], action.filters)

            expect(state.getIn(filtersPath)).toEqualImmutable(expectedState.getIn(filtersPath))
        })

        it('should reset filters', () => {
            const filtersPath = ['_internal', 'filters']
            const filters = {tags: [1, 5]}
            let state = reducer(initialState, setFilters(filters))
            state = reducer(state, {type: types.RESET_STATS_FILTERS})

            expect(state.getIn(filtersPath)).toEqualImmutable(initialState.getIn(filtersPath))
        })
    })
})
