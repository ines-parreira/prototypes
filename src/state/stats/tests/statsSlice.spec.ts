import {AnyAction} from 'redux'

import {
    initialState,
    mergeStatsFilters,
    resetStatsFilters,
    setStatsFilters,
    statsSlice,
} from 'state/stats/statsSlice'

describe('stats reducer', () => {
    it('should return initial state', () => {
        const anyAction: AnyAction = {type: 'anyAction'}

        expect(statsSlice.reducer(initialState, anyAction)).toEqual(
            initialState
        )
    })

    describe('resetStatsFilters', () => {
        it('should reset stats filters ', () => {
            const action = resetStatsFilters()

            const activeFilters = {agents: [1, 2]}
            const state = {
                ...initialState,
                filters: {...initialState.filters, activeFilters},
            }

            expect(statsSlice.reducer(state, action)).toEqual({
                filters: initialState.filters,
            })
        })
    })

    describe(`setStatsFilter`, () => {
        it('should set stats filters', () => {
            const filters = {
                period: {
                    start_datetime: '1970-01-01T00:00:00+00:00',
                    end_datetime: '1970-01-01T00:00:00+00:00',
                },
                tags: [1, 2, 4],
                agents: [1],
            }
            const action = setStatsFilters(filters)

            expect(statsSlice.reducer(initialState, action)).toEqual({
                ...initialState,
                filters,
            })
        })
    })

    describe('mergeStatsFilters', () => {
        it('should merge stats filters', () => {
            const filters = {
                tags: [1, 2, 4],
                agents: [1],
            }
            const action = mergeStatsFilters(filters)
            const state = {
                ...initialState,
                filters: {...initialState.filters, channels: ['1', '2']},
            }

            expect(statsSlice.reducer(state, action)).toEqual({
                ...initialState,
                filters: {
                    ...state.filters,
                    ...filters,
                },
            })
        })
    })
})
