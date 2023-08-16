import {StoreState} from 'state/types'
import {initialState} from 'state/ui/stats/reducer'
import {getCleanStatsFilters, isCleanStatsDirty} from '../selectors'

const store = {
    ui: {
        stats: initialState,
    },
} as StoreState

describe('ui/stats/selectors', () => {
    describe('isCleanStatsDirty', () => {
        it('should return cleanStats dirty state', () => {
            expect(isCleanStatsDirty(store)).toEqual(initialState.isFilterDirty)
        })
    })

    describe('getCleanStatsFilters', () => {
        it('should return clean StatsFilters state', () => {
            expect(getCleanStatsFilters(store)).toEqual(
                initialState.cleanStatsFilters
            )
        })
    })
})
