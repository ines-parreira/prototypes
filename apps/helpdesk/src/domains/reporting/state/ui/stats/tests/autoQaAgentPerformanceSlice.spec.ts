import { getSortByName } from '@repo/utils'
import { fromJS } from 'immutable'

import type { ReportingMetricItem } from 'domains/reporting/hooks/types'
import { TicketQAScoreMeasure } from 'domains/reporting/models/cubes/auto-qa/TicketQAScoreCube'
import {
    TicketDimension,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { AutoQAAgentsTableColumn } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAAgentsTableConfig'
import { initialState as initialStatsFiltersState } from 'domains/reporting/state/stats/statsSlice'
import {
    autoQAAgentPerformanceSlice,
    getAgentSorting,
    getFilteredAgents,
    getPaginatedAutoQAAgents,
    getSortedAutoQAAgents,
    initialState,
    isSortingMetricLoading,
    pageSet,
    sortingLoaded,
    sortingLoading,
    sortingSet,
    toggleHeatmapMode,
} from 'domains/reporting/state/ui/stats/autoQAAgentPerformanceSlice'
import {
    AGENT_PERFORMANCE_SLICE_NAME,
    AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME,
} from 'domains/reporting/state/ui/stats/constants'
import { initialState as uiFiltersInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
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
            [TicketDimension.AssigneeUserId]: '5',
            [TicketQAScoreMeasure.AverageScore]: '2.5',
        },
        {
            [TicketDimension.AssigneeUserId]: '4',
            [TicketQAScoreMeasure.AverageScore]: '2.0',
        },
        {
            [TicketDimension.AssigneeUserId]: '3',
            [TicketQAScoreMeasure.AverageScore]: '1.5',
        },
        {
            [TicketDimension.AssigneeUserId]: '2',
            [TicketQAScoreMeasure.AverageScore]: '1.0',
        },
        {
            [TicketDimension.AssigneeUserId]: '1',
            [TicketQAScoreMeasure.AverageScore]: '.5',
        },
    ]

    describe('reducers', () => {
        it('should keep sorting field, direction and loading state', () => {
            const newState = autoQAAgentPerformanceSlice.reducer(
                initialState,
                sortingSet({
                    field: AutoQAAgentsTableColumn.CommunicationSkills,
                    direction: OrderDirection.Desc,
                }),
            )

            expect(newState.sorting).toEqual({
                field: AutoQAAgentsTableColumn.CommunicationSkills,
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
                    [TicketQAScoreMeasure.AverageScore]: '123',
                    [TicketDimension.AssigneeUserId]: '456',
                },
            ]

            const newState = autoQAAgentPerformanceSlice.reducer(
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

            const newState = autoQAAgentPerformanceSlice.reducer(
                initialState,
                pageSet(page),
            )

            expect(newState.pagination.currentPage).toEqual(page)
        })

        it('should set the page to 1 if less then 1 given', () => {
            const page = -2

            const newState = autoQAAgentPerformanceSlice.reducer(
                initialState,
                pageSet(page),
            )

            expect(newState.pagination.currentPage).toEqual(
                initialState.pagination.currentPage,
            )
        })

        it('should reset the page to first when new sorting data starts loading', () => {
            const newState = autoQAAgentPerformanceSlice.reducer(
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
                            [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]:
                                initialState,
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
                            [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]:
                                initialState,
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
                            [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]:
                                initialState,
                        },
                        filters: uiFiltersInitialState,
                    },
                },
                stats: initialStatsFiltersState,
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
                        agents: [],
                    },
                },
            } as unknown as RootState

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
                            [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]:
                                initialState,
                        },
                        filters: {
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
                            [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]:
                                initialState,
                        },
                        filters: {
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
    })

    describe('getSortedAutoQAAgents', () => {
        it('should return agents sorted alphabetically if no sorting metric is declared', () => {
            const state = {
                agents: fromJS({ all: fromJS(agents) }),
                ui: {
                    stats: {
                        statsTables: {
                            [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]: {
                                ...initialState,
                                sorting: {
                                    ...initialState.sorting,
                                    field: AutoQAAgentsTableColumn.CommunicationSkills,
                                    direction: OrderDirection.Asc,
                                },
                            },
                        },
                        filters: uiFiltersInitialState,
                    },
                },
                stats: initialStatsFiltersState,
            } as RootState

            expect(getSortedAutoQAAgents(state)).toEqual(
                agents.sort(getSortByName),
            )
        })

        it('should return agents in descending order', () => {
            const state = {
                agents: fromJS({ all: fromJS(agents) }),
                ui: {
                    stats: {
                        statsTables: {
                            [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]: {
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

            expect(getSortedAutoQAAgents(state)).toEqual(
                [...agents.sort(getSortByName)].reverse(),
            )
        })

        it('should return agents sorted by selected metric', () => {
            const state = {
                agents: fromJS({ all: fromJS(agents) }),
                ui: {
                    stats: {
                        statsTables: {
                            [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]: {
                                ...initialState,
                                sorting: {
                                    ...initialState.sorting,
                                    field: AutoQAAgentsTableColumn.CommunicationSkills,
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

            expect(getSortedAutoQAAgents(state)).toEqual(
                metricData.map((metric) =>
                    agents.find(
                        (agent) =>
                            String(agent.id) ===
                            metric[TicketDimension.AssigneeUserId],
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
                    [TicketDimension.AssigneeUserId]: '2',
                    [TicketQAScoreMeasure.AverageScore]: '1.0',
                },
            ]

            const state = {
                agents: fromJS({ all: fromJS(agents) }),
                ui: {
                    stats: {
                        statsTables: {
                            [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]: {
                                ...initialState,
                                sorting: {
                                    ...initialState.sorting,
                                    field: AutoQAAgentsTableColumn.CommunicationSkills,
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

            expect(getSortedAutoQAAgents(state).pop()).toEqual(agents[0])
        })

        it('should return agents with no data at the end of sorted agents in any selected order', () => {
            const agents = [
                { id: 1, name: 'Adam' },
                { id: 2, name: 'Zoey' },
            ]
            const metricData: ReportingMetricItem[] = [
                {
                    [TicketDimension.AssigneeUserId]: '2',
                    [TicketQAScoreMeasure.AverageScore]: '10',
                },
            ]
            const noDataAgent = agents[0]

            const getStateWithOrderDirection = (direction: OrderDirection) =>
                ({
                    agents: fromJS({ all: fromJS(agents) }),
                    ui: {
                        stats: {
                            statsTables: {
                                [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]: {
                                    sorting: {
                                        field: AutoQAAgentsTableColumn.CommunicationSkills,
                                        direction,
                                        isLoading: false,
                                        lastSortingMetric: metricData,
                                    },
                                },
                            },
                            filters: uiFiltersInitialState,
                        },
                    },
                    stats: initialStatsFiltersState,
                }) as RootState

            expect(
                getSortedAutoQAAgents(
                    getStateWithOrderDirection(OrderDirection.Asc),
                ).pop(),
            ).toEqual(noDataAgent)

            expect(
                getSortedAutoQAAgents(
                    getStateWithOrderDirection(OrderDirection.Desc),
                ).pop(),
            ).toEqual(noDataAgent)
        })

        it('should not contain undefined or empty values throughout the result if the lastSortingMetric has more agents than the filtered ones', () => {
            const agents = personNames.map((name, idx) => ({ id: idx, name }))
            const lastSortingMetric: ReportingMetricItem[] = agents.map(
                (agent) => ({
                    [TicketMember.AssigneeUserId]: String(agent.id),
                    [TicketQAScoreMeasure.AverageScore]: '10',
                }),
            )
            const filteredAgents = [1, 4, 5, 10]
            const state = {
                agents: fromJS({ all: fromJS(agents) }),
                ui: {
                    stats: {
                        statsTables: {
                            [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]: {
                                ...initialState,
                                sorting: {
                                    ...initialState.sorting,
                                    field: AutoQAAgentsTableColumn.CommunicationSkills,
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
            } as RootState

            const sortedAgents = getSortedAutoQAAgents(state)

            expect(sortedAgents.length).toEqual(filteredAgents.length)
            expect(sortedAgents).not.toContain(undefined)
            expect(sortedAgents).not.toContain(null)
        })
    })

    describe('getPaginatedAutoQAAgents', () => {
        it('should return agents for current page with currentPage and perPage settings', () => {
            const currentPage = 2
            const perPage = 2

            const state = {
                agents: fromJS({ all: fromJS(agents) }),
                ui: {
                    stats: {
                        statsTables: {
                            [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]: {
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

            expect(getPaginatedAutoQAAgents(state)).toEqual({
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
            const newState = autoQAAgentPerformanceSlice.reducer(
                initialState,
                toggleHeatmapMode(),
            )

            expect(newState.heatmapMode).toEqual(!initialState.heatmapMode)
        })
    })
})
