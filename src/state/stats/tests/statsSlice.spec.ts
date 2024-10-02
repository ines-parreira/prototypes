import {AnyAction} from 'redux'
import {
    StatsFiltersWithLogicalOperator,
    TagFilterInstanceId,
} from 'models/stat/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
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
    setStatsFiltersWithLogicalOperators,
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
                integrations: [1, 2, 4],
                agents: [1],
            }
            const action = setStatsFilters(filters)

            expect(statsSlice.reducer(initialState, action)).toEqual({
                ...initialState,
                filters: fromLegacyStatsFilters(filters),
            })
        })
    })

    describe('setStatsFiltersWithLogicalOperators', () => {
        it('should set stats with operators filters', () => {
            const filters = {
                period: {
                    start_datetime: '2019-09-19T00:00:00Z',
                    end_datetime: '2019-09-25T23:59:59Z',
                },
                agents: {
                    values: [789726418],
                    operator: LogicalOperatorEnum.ONE_OF,
                },
                customFields: [
                    {
                        customFieldId: 5235,
                        values: ['5235::France'],
                        operator: LogicalOperatorEnum.NOT_ONE_OF,
                    },
                    {
                        customFieldId: 4960,
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [],
                    },
                ],
                slaPolicies: {
                    values: ['c489f8ec-0ca8-404b-8c4b-153cb578e212'],
                    operator: LogicalOperatorEnum.ONE_OF,
                },
            } as StatsFiltersWithLogicalOperator

            const action = setStatsFiltersWithLogicalOperators(filters)

            expect(statsSlice.reducer(initialState, action)).toEqual({
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
                filters: {
                    ...initialState.filters,
                    channels: withDefaultLogicalOperator(['1', '2']),
                },
            }

            expect(statsSlice.reducer(state, action)).toEqual({
                ...initialState,
                filters: {
                    ...state.filters,
                    tags: [
                        {
                            ...withDefaultLogicalOperator(filters.tags),
                            filterInstanceId: TagFilterInstanceId.First,
                        },
                    ],
                    agents: withDefaultLogicalOperator(filters.agents),
                },
            })
        })
    })

    describe('mergeStatsFiltersWithLogicalOperator', () => {
        it('should merge stats filters', () => {
            const filters: Partial<StatsFiltersWithLogicalOperator> = {
                tags: [
                    {
                        ...withDefaultLogicalOperator([1, 2, 4]),
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                ],
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
        const initialCustomField = withDefaultCustomFieldAndLogicalOperator({
            values: [],
            customFieldId: 2,
        })
        const defaultState = {
            ...initialState,
            filters: {
                ...initialState.filters,
                customFields: [initialCustomField],
            },
        }
        const newCustomField = withDefaultCustomFieldAndLogicalOperator({
            values: ['first:field'],
            customFieldId: 1,
        })
        const sameCustomField = withDefaultCustomFieldAndLogicalOperator({
            values: ['other:field'],
            customFieldId: 2,
        })

        it('should merge custom fields by replacing empty state with new customFields', () => {
            const state = {
                ...defaultState,
                filters: {
                    ...initialState.filters,
                    customFields: undefined,
                },
            }
            const action = mergeCustomFieldsFilter(newCustomField)

            expect(statsSlice.reducer(state, action)).toEqual({
                filters: {
                    ...initialState.filters,
                    customFields: [newCustomField],
                },
            })
        })

        it('should merge custom fields by replacing state with new customFields', () => {
            const action = mergeCustomFieldsFilter(newCustomField)

            expect(statsSlice.reducer(defaultState, action)).toEqual({
                filters: {
                    ...initialState.filters,
                    customFields: [initialCustomField, newCustomField],
                },
            })
        })

        it('should merge custom fields by changing its payload', () => {
            const action = mergeCustomFieldsFilter(sameCustomField)

            expect(statsSlice.reducer(defaultState, action)).toEqual({
                filters: {
                    ...initialState.filters,
                    customFields: [sameCustomField],
                },
            })
        })

        it('should merge custom fields keeping all fields in state', () => {
            const state = {
                ...defaultState,
                filters: {
                    ...initialState.filters,
                    customFields: [initialCustomField, newCustomField],
                },
            }
            const updatedCustomField = {
                values: ['first:field', 'second:field'],
                operator: LogicalOperatorEnum.ONE_OF,
                customFieldId: initialCustomField.customFieldId,
            }

            const action = mergeCustomFieldsFilter(updatedCustomField)

            expect(statsSlice.reducer(state, action)).toEqual({
                filters: {
                    ...initialState.filters,
                    customFields: [updatedCustomField, newCustomField],
                },
            })
        })
    })
})
