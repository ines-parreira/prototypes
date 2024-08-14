import {AnyAction} from 'redux'
import {
    withDefaultCustomFieldAndLogicalOperator,
    withDefaultLogicalOperator,
} from 'models/reporting/queryFactories/utils'

import {
    initialState,
    mergeCustomFieldsFilter,
    mergeStatsFilters,
    mergeStatsFiltersWithLogicalOperator,
    resetStatsFilters,
    setStatsFilters,
    statsSlice,
} from 'state/stats/statsSlice'
import {fromLegacyStatsFilters} from 'state/stats/utils'

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
                filters: fromLegacyStatsFilters(filters),
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
                filters: {
                    ...initialState.filters,
                    channels: withDefaultLogicalOperator(['1', '2']),
                },
            }

            expect(statsSlice.reducer(state, action)).toEqual({
                ...initialState,
                filters: {
                    ...state.filters,
                    tags: withDefaultLogicalOperator(filters.tags),
                    agents: withDefaultLogicalOperator(filters.agents),
                },
            })
        })
    })

    describe('mergeStatsFiltersWithLogicalOperator', () => {
        it('should merge stats filters', () => {
            const filters = {
                tags: withDefaultLogicalOperator([1, 2, 4]),
                agents: withDefaultLogicalOperator([1]),
            }
            const action = mergeStatsFiltersWithLogicalOperator(filters)
            const state = {
                ...initialState,
                filters: {
                    ...initialState.filters,
                    channels: withDefaultLogicalOperator(['1', '2']),
                },
            }

            expect(statsSlice.reducer(state, action)).toEqual({
                ...initialState,
                filters: {
                    ...state.filters,
                    tags: filters.tags,
                    agents: filters.agents,
                },
            })
        })
    })

    describe('mergeCustomFieldsFilter', () => {
        const state = {
            ...initialState,
            filters: {
                ...initialState.filters,
                customFields: [
                    withDefaultCustomFieldAndLogicalOperator({
                        values: [],
                        customFieldId: 2,
                    }),
                ],
            },
        }
        const newCustomField = withDefaultCustomFieldAndLogicalOperator({
            values: ['first:field'],
            customFieldId: 1,
        })

        it('should merge custom fields by replacing state with new customFields', () => {
            const action = mergeCustomFieldsFilter(newCustomField)
            expect(statsSlice.reducer(state, action)).toEqual({
                filters: {
                    ...initialState.filters,
                    customFields: [newCustomField],
                },
            })
        })

        const sameCustomField = withDefaultCustomFieldAndLogicalOperator({
            values: ['first:field'],
            customFieldId: 2,
        })

        it('should merge custom fields by changing its payload', () => {
            const action = mergeCustomFieldsFilter(sameCustomField)
            expect(statsSlice.reducer(state, action)).toEqual({
                filters: {
                    ...initialState.filters,
                    customFields: [sameCustomField],
                },
            })
        })
    })
})
