import { getSortByName } from '@repo/utils'
import { fromJS } from 'immutable'

import type { ReportingMetricItem } from 'domains/reporting/hooks/types'
import {
    TicketDimension,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
} from 'domains/reporting/models/cubes/TicketMessagesCube'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { initialState as initialStatsFiltersState } from 'domains/reporting/state/stats/statsSlice'
import {
    agentPerformanceSlice,
    getAgentSorting,
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
} from 'domains/reporting/state/ui/stats/agentPerformanceSlice'
import { AGENT_PERFORMANCE_SLICE_NAME } from 'domains/reporting/state/ui/stats/constants'
import { initialState as uiFiltersInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { AgentsTableColumn } from 'domains/reporting/state/ui/stats/types'
import { personNames } from 'fixtures/personNames'
import { OrderDirection } from 'models/api/types'
import type { RootState } from 'state/types'

describe('agentPerformanceSlice', () => {
    const agents = [
        { id: 1, name: 'Adam' },
        { id: 2, name: 'Zoey' },
        { id: 3, name: 'Betty' },
        { id: 4, name: 'Jim' },
        { id: 5, name: 'Barbie' },
    ]

    const metricData: ReportingMetricItem[] = [
        {
            [TicketMessagesDimension.FirstHelpdeskMessageUserId]: '5',
            [TicketMessagesMeasure.MedianFirstResponseTime]: '25',
        },
        {
            [TicketMessagesDimension.FirstHelpdeskMessageUserId]: '4',
            [TicketMessagesMeasure.MedianFirstResponseTime]: '20',
        },
        {
            [TicketMessagesDimension.FirstHelpdeskMessageUserId]: '3',
            [TicketMessagesMeasure.MedianFirstResponseTime]: '15',
        },
        {
            [TicketMessagesDimension.FirstHelpdeskMessageUserId]: '2',
            [TicketMessagesMeasure.MedianFirstResponseTime]: '10',
        },
        {
            [TicketMessagesDimension.FirstHelpdeskMessageUserId]: '1',
            [TicketMessagesMeasure.MedianFirstResponseTime]: '5',
        },
    ]

    describe('reducers', () => {
        it('should keep sorting field, direction and loading state', () => {
            const newState = agentPerformanceSlice.reducer(
                initialState,
                sortingSet({
                    field: AgentsTableColumn.ClosedTickets,
                    direction: OrderDirection.Desc,
                }),
            )

            expect(newState.sorting).toEqual({
                field: AgentsTableColumn.ClosedTickets,
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
                    [TicketMessagesMeasure.MedianFirstResponseTime]: '123',
                    [TicketDimension.AssigneeUserId]: '456',
                },
            ]

            const newState = agentPerformanceSlice.reducer(
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

            const newState = agentPerformanceSlice.reducer(
                initialState,
                pageSet(page),
            )

            expect(newState.pagination.currentPage).toEqual(page)
        })

        it('should set the page to 1 if less then 1 given', () => {
            const page = -2

            const newState = agentPerformanceSlice.reducer(
                initialState,
                pageSet(page),
            )

            expect(newState.pagination.currentPage).toEqual(
                initialState.pagination.currentPage,
            )
        })

        it('should reset the page to first when new sorting data starts loading', () => {
            const newState = agentPerformanceSlice.reducer(
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

    describe('getAgentSorting', () => {
        it('should return the current sorting', () => {
            const state = {
                ui: {
                    stats: {
                        statsTables: {
                            [AGENT_PERFORMANCE_SLICE_NAME]: initialState,
                        },
                    },
                },
            } as RootState

            expect(getAgentSorting(state)).toEqual(initialState.sorting)
        })
    })

    describe('getSortingMetricIsLoading', () => {
        it('should return the loading state of current sorting', () => {
            const state = {
                ui: {
                    stats: {
                        statsTables: {
                            [AGENT_PERFORMANCE_SLICE_NAME]: initialState,
                        },
                    },
                },
            } as RootState

            expect(isSortingMetricLoading(state)).toEqual(
                initialState.sorting.isLoading,
            )
        })
    })

    describe('getFilteredAgents', () => {
        it('should return all agents if no StatsFilter.agents', () => {
            const state = {
                agents: fromJS({ all: fromJS(agents) }),
                ui: {
                    stats: {
                        statsTables: {
                            [AGENT_PERFORMANCE_SLICE_NAME]: initialState,
                        },
                        filters: uiFiltersInitialState,
                    },
                },
            } as RootState

            expect(getFilteredAgents(state).length).toEqual(agents.length)
        })

        it('should return all agents if StatsFilter.agents is an empty array', () => {
            const state = {
                agents: fromJS({ all: fromJS(agents) }),
                ui: {
                    stats: {
                        statsTables: {
                            [AGENT_PERFORMANCE_SLICE_NAME]: initialState,
                        },
                        filters: uiFiltersInitialState,
                    },
                },
                stats: {
                    filters: {
                        period: {
                            start_datetime: '1970-01-01T00:00:00+00:00',
                            end_datetime: '1970-01-01T00:00:00+00:00',
                        },
                        // agents: withDefaultLogicalOperator([]),
                    },
                },
            } as RootState

            expect(getFilteredAgents(state).length).toEqual(agents.length)
        })

        it('should return filtered agents if StatsFilter.agents selected', () => {
            const filteredAgents = [1, 2]
            const cleanStatsFilters = {
                period: {
                    start_datetime: '1970-01-01T00:00:00+00:00',
                    end_datetime: '1970-01-01T00:00:00+00:00',
                },
                agents: withDefaultLogicalOperator(filteredAgents),
            }
            const state = {
                agents: fromJS({ all: fromJS(agents) }),
                ui: {
                    stats: {
                        statsTables: {
                            [AGENT_PERFORMANCE_SLICE_NAME]: initialState,
                        },
                        filters: {
                            ...uiFiltersInitialState,
                            cleanStatsFilters: cleanStatsFilters,
                        },
                    },
                },
                stats: {
                    filters: cleanStatsFilters,
                },
            } as RootState

            expect(getFilteredAgents(state).length).toEqual(
                filteredAgents.length,
            )
        })

        it('should not return excluded agents if StatsFilter.agents has not-one-of operator', () => {
            const filteredAgents = [1, 2]
            const cleanStatsFilters = {
                period: {
                    start_datetime: '1970-01-01T00:00:00+00:00',
                    end_datetime: '1970-01-01T00:00:00+00:00',
                },
                agents: {
                    values: filteredAgents,
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                },
            }
            const state = {
                agents: fromJS({ all: fromJS(agents) }),
                ui: {
                    stats: {
                        statsTables: {
                            [AGENT_PERFORMANCE_SLICE_NAME]: initialState,
                        },
                        filters: {
                            ...uiFiltersInitialState,
                            cleanStatsFilters: cleanStatsFilters,
                        },
                    },
                },
                stats: {
                    filters: cleanStatsFilters,
                },
            } as RootState

            expect(getFilteredAgents(state).length).toEqual(
                agents.filter((agent) => !filteredAgents.includes(agent.id))
                    .length,
            )
        })

        it('should return agents filtered by Saved Filter', () => {
            const filteredAgents = [1, 2]
            const savedFilterAgents = [3, 4]
            const cleanStatsFilters = {
                period: {
                    start_datetime: '1970-01-01T00:00:00+00:00',
                    end_datetime: '1970-01-01T00:00:00+00:00',
                },
                agents: {
                    values: filteredAgents,
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                },
            }
            const state = {
                agents: fromJS({ all: fromJS(agents) }),
                ui: {
                    stats: {
                        statsTables: {
                            [AGENT_PERFORMANCE_SLICE_NAME]: initialState,
                        },
                        filters: {
                            ...uiFiltersInitialState,
                            cleanStatsFilters: cleanStatsFilters,
                            appliedSavedFilterId: 123,
                            savedFilterDraft: {
                                id: 123,
                                name: 'string',
                                filter_group: [
                                    {
                                        member: FilterKey.Agents,
                                        operator: LogicalOperatorEnum.ONE_OF,
                                        values: savedFilterAgents.map(String),
                                    },
                                ],
                            },
                        },
                    },
                },
                stats: {
                    filters: cleanStatsFilters,
                },
            } as RootState

            expect(getFilteredAgents(state)).toEqual(
                agents.filter((agent) => savedFilterAgents.includes(agent.id)),
            )
        })
    })

    describe('getSortedAgents', () => {
        it('should return agents sorted alphabetically if no sorting metric is declared', () => {
            const state = {
                agents: fromJS({ all: fromJS(agents) }),
                ui: {
                    stats: {
                        statsTables: {
                            [AGENT_PERFORMANCE_SLICE_NAME]: {
                                ...initialState,
                                sorting: {
                                    ...initialState.sorting,
                                    field: AgentsTableColumn.ClosedTickets,
                                    direction: OrderDirection.Asc,
                                },
                            },
                        },
                        filters: uiFiltersInitialState,
                    },
                },
                stats: initialStatsFiltersState,
            } as RootState

            expect(getSortedAgents(state)).toEqual(agents.sort(getSortByName))
        })

        it('should return agents in descending order', () => {
            const state = {
                agents: fromJS({ all: fromJS(agents) }),
                ui: {
                    stats: {
                        statsTables: {
                            [AGENT_PERFORMANCE_SLICE_NAME]: {
                                sorting: {
                                    ...initialState.sorting,
                                    direction: OrderDirection.Desc,
                                },
                            },
                        },
                        filters: uiFiltersInitialState,
                    },
                },
                stats: initialStatsFiltersState,
            } as RootState

            expect(getSortedAgents(state)).toEqual(
                [...agents.sort(getSortByName)].reverse(),
            )
        })

        it('should return agents sorted by selected metric', () => {
            const state = {
                agents: fromJS({ all: fromJS(agents) }),
                ui: {
                    stats: {
                        statsTables: {
                            [AGENT_PERFORMANCE_SLICE_NAME]: {
                                ...initialState,
                                sorting: {
                                    ...initialState.sorting,
                                    field: AgentsTableColumn.MedianFirstResponseTime,
                                    direction: OrderDirection.Desc,
                                    isLoading: false,
                                    lastSortingMetric: metricData,
                                },
                            },
                        },
                        filters: uiFiltersInitialState,
                    },
                },
                stats: initialStatsFiltersState,
            } as RootState

            expect(getSortedAgents(state)).toEqual(
                metricData.map((metric) =>
                    agents.find(
                        (agent) =>
                            String(agent.id) ===
                            metric[
                                TicketMessagesDimension
                                    .FirstHelpdeskMessageUserId
                            ],
                    ),
                ),
            )
        })

        it('should return agents with no data last in descending order', () => {
            const agents = [
                { id: 1, name: 'Adam' },
                { id: 2, name: 'Zoey' },
            ]
            const metricData: ReportingMetricItem[] = [
                {
                    [TicketMessagesDimension.FirstHelpdeskMessageUserId]: '2',
                    [TicketMessagesMeasure.MedianFirstResponseTime]: '10',
                },
            ]

            const state = {
                agents: fromJS({ all: fromJS(agents) }),
                ui: {
                    stats: {
                        statsTables: {
                            [AGENT_PERFORMANCE_SLICE_NAME]: {
                                ...initialState,
                                sorting: {
                                    ...initialState.sorting,
                                    field: AgentsTableColumn.ClosedTickets,
                                    direction: OrderDirection.Desc,
                                    isLoading: false,
                                    lastSortingMetric: metricData,
                                },
                            },
                        },
                        filters: uiFiltersInitialState,
                    },
                },
                stats: initialStatsFiltersState,
            } as RootState

            expect(getSortedAgents(state).pop()).toEqual(agents[0])
        })

        it('should return agents with no data at the end of sorted agents in any selected order', () => {
            const agents = [
                { id: 1, name: 'Adam' },
                { id: 2, name: 'Zoey' },
            ]
            const metricData: ReportingMetricItem[] = [
                {
                    [TicketMessagesDimension.FirstHelpdeskMessageUserId]: '2',
                    [TicketMessagesMeasure.MedianFirstResponseTime]: '10',
                },
            ]
            const noDataAgent = agents[0]

            const getStateWithOrderDirection = (direction: OrderDirection) =>
                ({
                    agents: fromJS({ all: fromJS(agents) }),
                    ui: {
                        stats: {
                            statsTables: {
                                [AGENT_PERFORMANCE_SLICE_NAME]: {
                                    sorting: {
                                        field: AgentsTableColumn.ClosedTickets,
                                        direction,
                                        isLoading: false,
                                        lastSortingMetric: metricData,
                                    },
                                },
                            },
                            filters: uiFiltersInitialState,
                        },
                    },
                }) as RootState

            expect(
                getSortedAgents(
                    getStateWithOrderDirection(OrderDirection.Asc),
                ).pop(),
            ).toEqual(noDataAgent)

            expect(
                getSortedAgents(
                    getStateWithOrderDirection(OrderDirection.Desc),
                ).pop(),
            ).toEqual(noDataAgent)
        })

        it('should not contain undefined or empty values throughout the result if the lastSortingMetric has more agents than the filtered ones', () => {
            const agents = personNames.map((name, idx) => ({ id: idx, name }))
            const lastSortingMetric = agents.map((agent) => ({
                [TicketMember.AssigneeUserId]: String(agent.id),
                [TicketMessagesMeasure.MedianFirstResponseTime]: '10',
            }))
            const filteredAgents = [1, 4, 5, 10]
            const state = {
                agents: fromJS({ all: fromJS(agents) }),
                ui: {
                    stats: {
                        statsTables: {
                            [AGENT_PERFORMANCE_SLICE_NAME]: {
                                ...initialState,
                                sorting: {
                                    ...initialState.sorting,
                                    field: AgentsTableColumn.MedianFirstResponseTime,
                                    direction: OrderDirection.Asc,
                                    isLoading: false,
                                    lastSortingMetric,
                                },
                            },
                        },
                        filters: {
                            ...uiFiltersInitialState,
                            cleanStatsFilters: {
                                agents: withDefaultLogicalOperator(
                                    filteredAgents,
                                ),
                            },
                        },
                    },
                },
                stats: initialStatsFiltersState,
            } as unknown as RootState

            const sortedAgents = getSortedAgents(state)

            expect(sortedAgents.length).toEqual(filteredAgents.length)
            expect(sortedAgents).not.toContain(undefined)
            expect(sortedAgents).not.toContain(null)
        })
    })

    describe('getPaginatedAgents', () => {
        it('should return agents for current page with currentPage and perPage settings', () => {
            const currentPage = 2
            const perPage = 2

            const state = {
                agents: fromJS({ all: fromJS(agents) }),
                ui: {
                    stats: {
                        statsTables: {
                            [AGENT_PERFORMANCE_SLICE_NAME]: {
                                sorting: {
                                    ...initialState.sorting,
                                    direction: OrderDirection.Asc,
                                },
                                pagination: {
                                    currentPage,
                                    perPage,
                                },
                            },
                        },
                        filters: uiFiltersInitialState,
                    },
                },
                stats: initialStatsFiltersState,
            } as RootState

            expect(getPaginatedAgents(state)).toEqual({
                agents: agents.slice(
                    (currentPage - 1) * perPage,
                    currentPage * perPage,
                ),
                allAgents: agents,
                currentPage: currentPage,
                perPage: perPage,
            })
        })
    })

    describe('heatmap mode', () => {
        it('should toggle heatmapMode state', () => {
            const newState = agentPerformanceSlice.reducer(
                initialState,
                toggleHeatmapMode(),
            )

            expect(newState.heatmapMode).toEqual(!initialState.heatmapMode)
        })
    })
})
