import {mergeStatsFilters, resetStatsFilters, setStatsFilters} from '../actions'

describe('stats actions', () => {
    describe('mergeStatsFilters()', () => {
        it('should return an action to merge stats filters', () => {
            const filters = {tags: [1, 2, 3]}
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
            const filters = {
                period: {
                    start_datetime: '2021-02-03T00:00:00Z',
                    end_datetime: '2021-02-03T23:59:59Z',
                },
                tags: [1, 2, 3],
            }
            expect(setStatsFilters(filters)).toMatchSnapshot()
        })
    })
})
