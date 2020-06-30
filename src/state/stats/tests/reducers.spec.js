import {fromJS} from 'immutable'

import statsReducer, {initialState} from '../reducers'
import * as constants from '../constants'

jest.mock('moment', () => {
    return () => require.requireActual('moment')('2019-09-03')
})

describe('reducers', () => {
    describe('stat', () => {
        it('should return initial state', () => {
            expect(statsReducer(initialState, {})).toMatchSnapshot()
        })

        describe('RESET_STATS_FILTERS', () => {
            it('shoud reset stats filters ', () => {
                const action = {type: constants.RESET_STATS_FILTERS}
                const activeFilters = fromJS({score: 4})
                const state = initialState.set('filters', activeFilters)
                expect(statsReducer(state, action)).toMatchSnapshot()
            })
        })

        describe('SET_STATS_FILTERS', () => {
            it('should set stats filters', () => {
                const action = {
                    type: constants.SET_STATS_FILTERS,
                    filters: fromJS({
                        tags: [1, 2, 4],
                        agents: [1],
                    }),
                }
                const state = initialState.set('filters', null)
                expect(statsReducer(state, action)).toMatchSnapshot()
            })
        })

        describe('MERGE_STATS_FILTERS', () => {
            it('should merge stats filters', () => {
                const action = {
                    type: constants.MERGE_STATS_FILTERS,
                    filters: fromJS({
                        tags: [1, 2, 4],
                        agents: [1],
                    }),
                }
                const state = initialState.set('filters', fromJS({score: 4}))
                expect(statsReducer(state, action)).toMatchSnapshot()
            })
        })
    })
})
