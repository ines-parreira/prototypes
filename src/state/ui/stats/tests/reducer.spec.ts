import {fromLegacyStatsFilters} from 'state/stats/utils'
import reducer, {initialState} from 'state/ui/stats/reducer'
import {
    fetchStatStarted,
    fetchStatEnded,
    statFiltersDirty,
    statFiltersClean,
    statFiltersCleanWithPayload,
    statFiltersWithLogicalOperatorsCleanWithPayload,
} from 'state/ui/stats/actions'

describe('stats reducer', () => {
    describe('fetchStatStarted action', () => {
        it('should set the stat fetching status to true', () => {
            const newState = reducer(
                initialState,
                fetchStatStarted({
                    statName: 'overview',
                    resourceName: 'total-tickets-replied',
                })
            )

            expect(newState).toMatchSnapshot()
        })
    })

    describe('fetchStatEnded action', () => {
        it('should set the stat fetching status to false', () => {
            const newState = reducer(
                initialState,
                fetchStatEnded({
                    statName: 'overview',
                    resourceName: 'total-tickets-replied',
                })
            )

            expect(newState).toMatchSnapshot()
        })
    })

    describe('statFiltersDirty action', () => {
        it('should set the isDirty flag to true', () => {
            const newState = reducer(initialState, statFiltersDirty())

            expect(newState.isFilterDirty).toBe(true)
        })
    })

    describe('statFiltersClean action', () => {
        it('should set the isDirty flag to false', () => {
            const newState = reducer(initialState, statFiltersClean())

            expect(newState.isFilterDirty).toBe(false)
        })
    })

    describe('statFiltersCleanWithPayload', () => {
        it('should disable the dirty flag and store the payload', () => {
            const newFilters = {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                agents: [1, 2],
            }

            const newState = reducer(
                {...initialState, isFilterDirty: true},
                statFiltersCleanWithPayload(newFilters)
            )

            expect(newState.isFilterDirty).toEqual(false)
            expect(newState.cleanStatsFilters).toEqual(
                fromLegacyStatsFilters(newFilters)
            )
        })
    })

    describe('statFiltersCleanWithPayload', () => {
        it('should disable the dirty flag and store the payload', () => {
            const newFilters = fromLegacyStatsFilters({
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                agents: [1, 2],
            })

            const newState = reducer(
                {...initialState, isFilterDirty: true},
                statFiltersWithLogicalOperatorsCleanWithPayload(newFilters)
            )

            expect(newState.isFilterDirty).toEqual(false)
            expect(newState.cleanStatsFilters).toEqual(newFilters)
        })
    })
})
