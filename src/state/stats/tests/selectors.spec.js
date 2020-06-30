import {fromJS} from 'immutable'

import {initialState} from '../reducers'
import * as selectors from '../selectors'
import {EMAIL_CHANNEL} from '../../../config/ticket'

describe('selectors', () => {
    describe('stats', () => {
        let state = null

        beforeEach(() => {
            state = {
                stats: initialState,
            }
        })

        describe('getStatsState()', () => {
            it('should return the whole `stats` state, or an empty Map', () => {
                expect(selectors.getStatsState(state)).toEqual(state.stats)
            })
        })

        describe('getFilters()', () => {
            it('should return existing filters', () => {
                const filters = fromJS({tags: [1, 2]})
                state.stats = state.stats.set('filters', filters)
                expect(selectors.getFilters(state)).toEqual(filters)

                state.stats = state.stats.set('filters', null)
                expect(selectors.getFilters(state)).toEqual(null)
            })
        })

        describe('getViewfilters()', () => {
            it('should return no filter for the given view because there is no filter', () => {
                state.stats = state.stats.set('filters', null)
                expect(selectors.getViewFilters('overview')(state)).toEqual(
                    null
                )
            })

            it('should return filters for the given view', () => {
                const filters = fromJS({
                    tags: [1, 2],
                    agents: [234, 654],
                    score: '4',
                    channels: [EMAIL_CHANNEL],
                    period: {
                        start_datetime: '2019-03-09',
                        end_datetime: '2019-03-10',
                    },
                })
                state.stats = state.stats.set('filters', filters)
                expect(
                    selectors.getViewFilters('overview')(state)
                ).toMatchSnapshot()
                expect(
                    selectors.getViewFilters('satisfaction')(state)
                ).toMatchSnapshot()
            })
        })
    })
})
