import {fromJS} from 'immutable'
import {
    TicketDimension,
    TicketMeasure,
    TicketMember,
} from 'models/reporting/types'
import {OrderDirection} from 'models/api/types'
import {initialState as initialStatsFiltersState} from 'state/stats/reducers'
import {
    initialState,
    agentPerformanceSlice,
    getAgentSorting,
    sortingSet,
    sortingLoaded,
    getSortedAgents,
    isSortingMetricLoading,
    getPaginatedAgents,
    pageSet,
    getFilteredAgents,
} from 'state/ui/stats/agentPerformanceSlice'
import {RootState} from 'state/types'
import {TableColumn} from 'state/ui/stats/types'
import {getSortByName} from 'utils/getSortByName'

describe('agentPerformanceSlice', () => {
    const agents = [
        {id: 1, name: 'Adam'},
        {id: 2, name: 'Zoey'},
        {id: 3, name: 'Betty'},
        {id: 4, name: 'Jim'},
        {id: 5, name: 'Barbie'},
    ]

    const metricData = [
        {
            [TicketMember.AssigneeUserId]: '5',
            [TicketMeasure.FirstResponseTime]: '25',
        },
        {
            [TicketMember.AssigneeUserId]: '4',
            [TicketMeasure.FirstResponseTime]: '20',
        },
        {
            [TicketMember.AssigneeUserId]: '3',
            [TicketMeasure.FirstResponseTime]: '15',
        },
        {
            [TicketMember.AssigneeUserId]: '2',
            [TicketMeasure.FirstResponseTime]: '10',
        },
        {
            [TicketMember.AssigneeUserId]: '1',
            [TicketMeasure.FirstResponseTime]: '5',
        },
    ]

    describe('reducers', () => {
        it('should keep sorting field, direction and loading state', () => {
            const newState = agentPerformanceSlice.reducer(
                initialState,
                sortingSet({
                    field: TableColumn.ClosedTickets,
                    direction: OrderDirection.Desc,
                })
            )

            expect(newState.sorting).toEqual({
                field: TableColumn.ClosedTickets,
                direction: OrderDirection.Desc,
                isLoading: true,
                lastSortingMetric: null,
            })
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
                    [TicketMeasure.FirstResponseTime]: '123',
                    [TicketDimension.AssigneeUserId]: '456',
                },
            ]

            const newState = agentPerformanceSlice.reducer(
                loadingState,
                sortingLoaded(metricData)
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
                pageSet(page)
            )

            expect(newState.pagination.currentPage).toEqual(page)
        })

        it('should set the page to 1 if less then 1 given', () => {
            const page = -2

            const newState = agentPerformanceSlice.reducer(
                initialState,
                pageSet(page)
            )

            expect(newState.pagination.currentPage).toEqual(
                initialState.pagination.currentPage
            )
        })
    })

    describe('getAgentSorting', () => {
        it('should return the current sorting', () => {
            const state = {
                ui: {[agentPerformanceSlice.name]: initialState},
            } as RootState

            expect(getAgentSorting(state)).toEqual(initialState.sorting)
        })
    })

    describe('getSortingMetricIsLoading', () => {
        it('should return the loading state of current sorting', () => {
            const state = {
                ui: {[agentPerformanceSlice.name]: initialState},
            } as RootState

            expect(isSortingMetricLoading(state)).toEqual(
                initialState.sorting.isLoading
            )
        })
    })

    describe('getFilteredAgents', () => {
        it('should return all agents if no StatsFilter.agents ', () => {
            const state = {
                agents: fromJS({all: fromJS(agents)}),
                ui: {[agentPerformanceSlice.name]: initialState},
                stats: initialStatsFiltersState,
            } as RootState

            expect(getFilteredAgents(state).length).toEqual(agents.length)
        })

        it('should return filtered agents if StatsFilter.agents selected', () => {
            const filteredAgents = [1, 2]
            const state = {
                agents: fromJS({all: fromJS(agents)}),
                ui: {[agentPerformanceSlice.name]: initialState},
                stats: fromJS({
                    filters: {
                        period: {
                            start_datetime: '1970-01-01T00:00:00+00:00',
                            end_datetime: '1970-01-01T00:00:00+00:00',
                        },
                        agents: filteredAgents,
                    },
                }),
            } as RootState

            expect(getFilteredAgents(state).length).toEqual(
                filteredAgents.length
            )
        })
    })

    describe('getSortedAgents', () => {
        it('should return agents sorted alphabetically if no sorting metric is declared', () => {
            const state = {
                agents: fromJS({all: fromJS(agents)}),
                ui: {[agentPerformanceSlice.name]: initialState},
                stats: initialStatsFiltersState,
            } as RootState

            expect(getSortedAgents(state)).toEqual(agents.sort(getSortByName))
        })

        it('should return agents in descending order', () => {
            const state = {
                agents: fromJS({all: fromJS(agents)}),
                ui: {
                    [agentPerformanceSlice.name]: {
                        sorting: {
                            ...initialState.sorting,
                            direction: OrderDirection.Desc,
                        },
                    },
                },
                stats: initialStatsFiltersState,
            } as RootState

            expect(getSortedAgents(state)).toEqual(
                [...agents.sort(getSortByName)].reverse()
            )
        })

        it('should return agents in alphabetical order if no sorting metric is declared', () => {
            const state = {
                agents: fromJS({all: fromJS(agents)}),
                ui: {[agentPerformanceSlice.name]: initialState},
                stats: initialStatsFiltersState,
            } as RootState

            expect(getSortedAgents(state)).toEqual(agents.sort(getSortByName))
        })

        it('should return agents sorted by selected metric', () => {
            const state = {
                agents: fromJS({all: fromJS(agents)}),
                ui: {
                    [agentPerformanceSlice.name]: {
                        sorting: {
                            field: TableColumn.FirstResponseTime,
                            direction: OrderDirection.Desc,
                            isLoading: false,
                            lastSortingMetric: metricData,
                        },
                    },
                },
                stats: initialStatsFiltersState,
            } as RootState

            expect(getSortedAgents(state)).toEqual(
                metricData.map((metric) =>
                    agents.find(
                        (agent) =>
                            String(agent.id) ===
                            metric[TicketMember.AssigneeUserId]
                    )
                )
            )
        })

        it('should return agents with no data last', () => {
            const agents = [
                {id: 1, name: 'Adam'},
                {id: 2, name: 'Zoey'},
            ]
            const metricData = [
                {
                    [TicketMember.AssigneeUserId]: '2',
                    [TicketMeasure.FirstResponseTime]: '10',
                },
            ]

            const state = {
                agents: fromJS({all: fromJS(agents)}),
                ui: {
                    [agentPerformanceSlice.name]: {
                        sorting: {
                            field: TableColumn.ClosedTickets,
                            direction: OrderDirection.Desc,
                            isLoading: false,
                            lastSortingMetric: metricData,
                        },
                    },
                },
                stats: initialStatsFiltersState,
            } as RootState

            expect(getSortedAgents(state).pop()).toEqual(agents[0])
        })
    })

    describe('getPaginatedAgents', () => {
        it('should return agents for current page with currentPage and perPage settings', () => {
            const currentPage = 2
            const perPage = 2

            const state = {
                agents: fromJS({all: fromJS(agents)}),
                ui: {
                    [agentPerformanceSlice.name]: {
                        sorting: initialState.sorting,
                        pagination: {
                            currentPage,
                            perPage,
                        },
                    },
                },
                stats: initialStatsFiltersState,
            } as RootState

            expect(getPaginatedAgents(state)).toEqual({
                agents: agents.slice(
                    (currentPage - 1) * perPage,
                    currentPage * perPage
                ),
                currentPage: currentPage,
                perPage: perPage,
            })
        })
    })
})
