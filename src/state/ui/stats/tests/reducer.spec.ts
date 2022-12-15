import {
    fetchStatStarted,
    fetchStatEnded,
    statFiltersDirty,
    statFiltersClean,
} from '../actions'
import reducer, {initialState} from '../reducer'

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
})
