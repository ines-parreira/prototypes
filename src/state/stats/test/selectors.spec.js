import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import * as selectors from '../selectors'
import {TICKETS_CLOSED_PER_AGENT} from '../../../config/stats'

jest.addMatchers(immutableMatchers)


describe('stats selectors', () => {
    let state

    beforeEach(() => {
        state = {
            stats: fromJS({})
        }

        state.stats = state.stats.set(TICKETS_CLOSED_PER_AGENT, fromJS({
            data: {
                lines: [
                    ['foo', 1, 100, 10],
                    ['bar', 2, 50, 7],
                    ['boo', 4, 70, 12],
                    ['far', 6, 120, 15]
                ]
            }
        }))
    })

    describe('getStats selector', () => {
        it('should return the whole `stats` state, or an empty Map', () => {
            expect(selectors.getStats(state)).toEqualImmutable(state.stats)
            expect(selectors.getStats({})).toEqualImmutable(fromJS({}))
        })
    })

    describe('get filters', () => {
        it('should return no filters', () => {
            expect(selectors.getFilters(state)).toEqualImmutable(undefined)
        })

        it('should return existing filters', () => {
            const filters = fromJS({tags: [1, 2]})
            state.stats = state.stats.setIn(['_internal', 'filters'], filters)
            expect(selectors.getFilters(state)).toEqualImmutable(filters)
        })
    })
})
