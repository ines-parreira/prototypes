import {fromJS} from 'immutable'

import {
    mergeStatsFilters,
    resetStatsFilters,
    setStatsFilters,
} from '../actions.ts'

describe('actions', () => {
    describe('stats', () => {
        describe('mergeStatsFilters()', () => {
            it('should return an action to merge stats filters', () => {
                const filters = fromJS({tags: [1, 2, 3]})
                expect(mergeStatsFilters(filters)).toMatchSnapshot()
            })
        })

        describe('resetStatsFilters()', () => {
            it('should return an action to reset stats filters', () => {
                expect(resetStatsFilters()).toMatchSnapshot()
            })
        })

        describe('setStatsFilters()', () => {
            it('should return an action to set stats filters', () => {
                const filters = fromJS({tags: [1, 2, 3]})
                expect(setStatsFilters(filters)).toMatchSnapshot()
            })
        })
    })
})
