import { getSortByName } from '@repo/utils'
import { fromJS } from 'immutable'

import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { AGENT_AVAILABILITY_COLUMNS } from 'domains/reporting/pages/support-performance/agents/constants/agentAvailability'
import {
    agentAvailabilitySlice,
    getAgentSorting,
    getAgentsPagination,
    getFilteredAgents,
    getPaginatedAgents,
    getSortedAgents,
    initialState,
    isSortingMetricLoading,
    pageSet,
    sortingLoaded,
    sortingLoading,
    sortingSet,
    toggleHeatmapMode,
} from 'domains/reporting/state/ui/stats/agentAvailabilitySlice'
import { AGENT_AVAILABILITY_SLICE_NAME } from 'domains/reporting/state/ui/stats/constants'
import { initialState as uiFiltersInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { OrderDirection } from 'models/api/types'
import type { RootState } from 'state/types'

const { ONLINE_TIME_COLUMN } = AGENT_AVAILABILITY_COLUMNS

describe('agentAvailabilitySlice', () => {
    describe('reducers', () => {
        it('should keep sorting field, direction and loading state', () => {
            const newState = agentAvailabilitySlice.reducer(
                initialState,
                sortingSet({
                    field: ONLINE_TIME_COLUMN,
                    direction: OrderDirection.Desc,
                }),
            )

            expect(newState.sorting).toEqual({
                field: ONLINE_TIME_COLUMN,
                direction: OrderDirection.Desc,
                isLoading: true,
                lastSortingMetric: null,
            })
            expect(newState.pagination.currentPage).toEqual(1)
        })

        it('should keep lastSortingMetric and disable isLoading on sortingLoaded action', () => {
            const loadingState = {
                ...initialState,
                sorting: {
                    ...initialState.sorting,
                    isLoading: true,
                },
            }
            const metricData = [
                {
                    agentId: '1',
                    value: 3600,
                },
                {
                    agentId: '2',
                    value: 7200,
                },
            ]

            const newState = agentAvailabilitySlice.reducer(
                loadingState,
                sortingLoaded(metricData),
            )

            expect(newState).toEqual({
                ...initialState,
                sorting: {
                    ...initialState.sorting,
                    isLoading: false,
                    lastSortingMetric: metricData,
                },
            })
        })

        it('should set the page', () => {
            const page = 4

            const newState = agentAvailabilitySlice.reducer(
                initialState,
                pageSet(page),
            )

            expect(newState.pagination.currentPage).toEqual(page)
        })

        it('should set the page to 1 if less then 1 given', () => {
            const page = -2

            const newState = agentAvailabilitySlice.reducer(
                initialState,
                pageSet(page),
            )

            expect(newState.pagination.currentPage).toEqual(
                initialState.pagination.currentPage,
            )
        })

        it('should reset the page to first when new sorting data starts loading', () => {
            const newState = agentAvailabilitySlice.reducer(
                {
                    ...initialState,
                    pagination: {
                        ...initialState.pagination,
                        currentPage: 5,
                    },
                },
                sortingLoading(),
            )

            expect(newState.sorting.isLoading).toEqual(true)
            expect(newState.pagination.currentPage).toEqual(1)
        })
    })

    describe('selectors', () => {
        describe('getAgentSorting', () => {
            it('should return the current sorting', () => {
                const state = {
                    ui: {
                        stats: {
                            statsTables: {
                                [AGENT_AVAILABILITY_SLICE_NAME]: initialState,
                            },
                        },
                    },
                } as unknown as RootState

                expect(getAgentSorting(state)).toEqual(initialState.sorting)
            })
        })

        describe('isSortingMetricLoading', () => {
            it('should return the loading state of current sorting', () => {
                const state = {
                    ui: {
                        stats: {
                            statsTables: {
                                [AGENT_AVAILABILITY_SLICE_NAME]: initialState,
                            },
                        },
                    },
                } as unknown as RootState

                expect(isSortingMetricLoading(state)).toEqual(
                    initialState.sorting.isLoading,
                )
            })
        })
    })

    describe('getAgentsPagination', () => {
        it('should return the current pagination', () => {
            const state = {
                ui: {
                    stats: {
                        statsTables: {
                            [AGENT_AVAILABILITY_SLICE_NAME]: initialState,
                        },
                    },
                },
            } as unknown as RootState

            expect(getAgentsPagination(state)).toEqual(initialState.pagination)
        })
    })

    describe('getFilteredAgents', () => {
        const agents = [
            { id: 1, name: 'Adam' },
            { id: 2, name: 'Zoey' },
            { id: 3, name: 'Betty' },
        ]

        const buildState = (filtersOverride = {}) => ({
            agents: fromJS({ all: fromJS(agents) }),
            ui: {
                stats: {
                    statsTables: {
                        [AGENT_AVAILABILITY_SLICE_NAME]: initialState,
                    },
                    filters: { ...uiFiltersInitialState, ...filtersOverride },
                },
            },
        })

        it('should return all agents when no filter is applied', () => {
            const state = buildState() as unknown as RootState

            expect(getFilteredAgents(state).length).toEqual(agents.length)
        })

        it('should return only matching agents when ONE_OF filter is applied', () => {
            const filteredAgentIds = [1, 2]
            const state = buildState({
                cleanStatsFilters: {
                    agents: withDefaultLogicalOperator(filteredAgentIds),
                },
            }) as unknown as RootState

            expect(getFilteredAgents(state).length).toEqual(
                filteredAgentIds.length,
            )
        })

        it('should exclude agents when NOT_ONE_OF filter is applied', () => {
            const excludedAgentIds = [1, 2]
            const state = buildState({
                cleanStatsFilters: {
                    agents: {
                        values: excludedAgentIds,
                        operator: LogicalOperatorEnum.NOT_ONE_OF,
                    },
                },
            }) as unknown as RootState

            expect(getFilteredAgents(state).length).toEqual(
                agents.filter((a) => !excludedAgentIds.includes(a.id)).length,
            )
        })

        it('should use saved filter agents when a saved filter is applied', () => {
            const savedFilterAgentIds = [3]
            const state = buildState({
                appliedSavedFilterId: 99,
                savedFilterDraft: {
                    id: 99,
                    name: 'My filter',
                    filter_group: [
                        {
                            member: FilterKey.Agents,
                            operator: LogicalOperatorEnum.ONE_OF,
                            values: savedFilterAgentIds.map(String),
                        },
                    ],
                },
            }) as unknown as RootState

            expect(getFilteredAgents(state)).toEqual(
                agents.filter((a) => savedFilterAgentIds.includes(a.id)),
            )
        })
    })

    describe('getSortedAgents', () => {
        const agents = [
            { id: 1, name: 'Adam' },
            { id: 2, name: 'Zoey' },
            { id: 3, name: 'Betty' },
        ]

        const buildState = (sortingOverride = {}) => ({
            agents: fromJS({ all: fromJS(agents) }),
            ui: {
                stats: {
                    statsTables: {
                        [AGENT_AVAILABILITY_SLICE_NAME]: {
                            ...initialState,
                            sorting: {
                                ...initialState.sorting,
                                ...sortingOverride,
                            },
                        },
                    },
                    filters: uiFiltersInitialState,
                },
            },
        })

        it('should sort agents alphabetically in ascending order', () => {
            const state = buildState({
                direction: OrderDirection.Asc,
            }) as unknown as RootState

            expect(getSortedAgents(state)).toEqual(
                [...agents].sort(getSortByName),
            )
        })

        it('should sort agents alphabetically in descending order', () => {
            const state = buildState({
                direction: OrderDirection.Desc,
            }) as unknown as RootState

            expect(getSortedAgents(state)).toEqual(
                [...agents].sort(getSortByName).reverse(),
            )
        })

        it('should sort agents by metric order when lastSortingMetric is available', () => {
            const metricData = [
                { agentId: '3', value: 300 },
                { agentId: '1', value: 200 },
                { agentId: '2', value: 100 },
            ]

            const state = buildState({
                field: ONLINE_TIME_COLUMN,
                isLoading: false,
                lastSortingMetric: metricData,
            }) as unknown as RootState

            expect(getSortedAgents(state)).toEqual(
                metricData.map((m) =>
                    agents.find((a) => String(a.id) === m.agentId),
                ),
            )
        })

        it('should place agents with no metric data at the end', () => {
            const metricData = [{ agentId: '2', value: 100 }]

            const state = buildState({
                field: ONLINE_TIME_COLUMN,
                isLoading: false,
                lastSortingMetric: metricData,
            }) as unknown as RootState

            const result = getSortedAgents(state)

            expect(result[0]).toEqual(agents.find((a) => a.id === 2))
            expect(result[result.length - 1]).not.toEqual(
                agents.find((a) => a.id === 2),
            )
        })
    })

    describe('getPaginatedAgents', () => {
        const agents = [
            { id: 1, name: 'Adam' },
            { id: 2, name: 'Zoey' },
            { id: 3, name: 'Betty' },
            { id: 4, name: 'Jim' },
            { id: 5, name: 'Barbie' },
        ]

        it('should return the correct page of agents', () => {
            const currentPage = 2
            const perPage = 2

            const state = {
                agents: fromJS({ all: fromJS(agents) }),
                ui: {
                    stats: {
                        statsTables: {
                            [AGENT_AVAILABILITY_SLICE_NAME]: {
                                ...initialState,
                                sorting: {
                                    ...initialState.sorting,
                                    direction: OrderDirection.Asc,
                                },
                                pagination: { currentPage, perPage },
                            },
                        },
                        filters: uiFiltersInitialState,
                    },
                },
            } as unknown as RootState

            const sortedAgents = [...agents].sort(getSortByName)

            expect(getPaginatedAgents(state)).toEqual({
                agents: sortedAgents.slice(
                    (currentPage - 1) * perPage,
                    currentPage * perPage,
                ),
                allAgents: sortedAgents,
                currentPage,
                perPage,
            })
        })
    })

    describe('heatmap mode', () => {
        it('should toggle heatmapMode state', () => {
            const newState = agentAvailabilitySlice.reducer(
                initialState,
                toggleHeatmapMode(),
            )

            expect(newState.heatmapMode).toEqual(!initialState.heatmapMode)
        })
    })
})
