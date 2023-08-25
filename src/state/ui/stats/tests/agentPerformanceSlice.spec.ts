import {fromJS} from 'immutable'
import {personNames} from 'fixtures/personNames'
import {user} from 'fixtures/users'
import {OrderDirection} from 'models/api/types'
import {
    TicketDimension,
    TicketMeasure,
    TicketMember,
} from 'models/reporting/types'
import {DEFAULT_TIMEZONE} from 'pages/stats/revenue/constants/components'
import {initialState as currentUserInitialState} from 'state/currentUser/reducers'
import {
    defaultStatsFilters,
    initialState as initialStatsFiltersState,
} from 'state/stats/reducers'
import {getPageStatsFilters} from 'state/stats/selectors'
import {RootState} from 'state/types'
import {
    agentPerformanceSlice,
    getAgentSorting,
    getCleanStatsFiltersWithTimezone,
    getFilteredAgents,
    getPaginatedAgents,
    getSortedAgents,
    initialState,
    isSortingMetricLoading,
    pageSet,
    sortingLoaded,
    sortingLoading,
    sortingSet,
} from 'state/ui/stats/agentPerformanceSlice'
import {initialState as initialUiStatsState} from 'state/ui/stats/reducer'
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

        it('should reset the page to first when new sorting data starts loading', () => {
            const newState = agentPerformanceSlice.reducer(
                {
                    ...initialState,
                    pagination: {
                        ...initialState.pagination,
                        currentPage: 5,
                    },
                },
                sortingLoading()
            )

            expect(newState.sorting.isLoading).toEqual(true)
            expect(newState.pagination.currentPage).toEqual(1)
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
        it('should return all agents if no StatsFilter.agents', () => {
            const state = {
                agents: fromJS({all: fromJS(agents)}),
                ui: {
                    [agentPerformanceSlice.name]: initialState,
                    stats: initialUiStatsState,
                },
                stats: initialStatsFiltersState,
            } as RootState

            expect(getFilteredAgents(state).length).toEqual(agents.length)
        })

        it('should return all agents if StatsFilter.agents is an empty array', () => {
            const state = {
                agents: fromJS({all: fromJS(agents)}),
                ui: {
                    [agentPerformanceSlice.name]: initialState,
                    stats: initialUiStatsState,
                },
                stats: fromJS({
                    filters: {
                        period: {
                            start_datetime: '1970-01-01T00:00:00+00:00',
                            end_datetime: '1970-01-01T00:00:00+00:00',
                        },
                        agents: [],
                    },
                }),
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
                agents: filteredAgents,
            }
            const state = {
                agents: fromJS({all: fromJS(agents)}),
                ui: {
                    [agentPerformanceSlice.name]: initialState,
                    stats: {
                        ...initialUiStatsState,
                        cleanStatsFilters: cleanStatsFilters,
                    },
                },
                stats: fromJS({
                    filters: cleanStatsFilters,
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
                ui: {
                    [agentPerformanceSlice.name]: {
                        ...initialState,
                        sorting: {
                            ...initialState.sorting,
                            field: TableColumn.ClosedTickets,
                            direction: OrderDirection.Asc,
                        },
                    },
                    stats: initialUiStatsState,
                },
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
                    stats: initialUiStatsState,
                },
                stats: initialStatsFiltersState,
            } as RootState

            expect(getSortedAgents(state)).toEqual(
                [...agents.sort(getSortByName)].reverse()
            )
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
                    stats: initialUiStatsState,
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

        it('should return agents with no data last in descending order', () => {
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
                    stats: initialUiStatsState,
                },
                stats: initialStatsFiltersState,
            } as RootState

            expect(getSortedAgents(state).pop()).toEqual(agents[0])
        })

        it('should return agents with no data at the end of sorted agents in any selected order', () => {
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
            const noDataAgent = agents[0]

            const getStateWithOrderDirection = (direction: OrderDirection) =>
                ({
                    agents: fromJS({all: fromJS(agents)}),
                    ui: {
                        [agentPerformanceSlice.name]: {
                            sorting: {
                                field: TableColumn.ClosedTickets,
                                direction,
                                isLoading: false,
                                lastSortingMetric: metricData,
                            },
                        },
                        stats: initialUiStatsState,
                    },
                    stats: initialStatsFiltersState,
                } as RootState)

            expect(
                getSortedAgents(
                    getStateWithOrderDirection(OrderDirection.Asc)
                ).pop()
            ).toEqual(noDataAgent)

            expect(
                getSortedAgents(
                    getStateWithOrderDirection(OrderDirection.Desc)
                ).pop()
            ).toEqual(noDataAgent)
        })
        it('should not contain undefined or empty values throughout the result if the lastSortingMetric has more agents than the filtered ones', () => {
            const agents = personNames.map((name, idx) => ({id: idx, name}))
            const lastSortingMetric = agents.map((agent) => ({
                [TicketMember.AssigneeUserId]: String(agent.id),
                [TicketMeasure.FirstResponseTime]: '10',
            }))
            const filteredAgents = [1, 4, 5, 10]
            const state = {
                agents: fromJS({all: fromJS(agents)}),
                ui: {
                    [agentPerformanceSlice.name]: {
                        sorting: {
                            field: TableColumn.FirstResponseTime,
                            direction: OrderDirection.Asc,
                            isLoading: false,
                            lastSortingMetric,
                        },
                    },
                    stats: {
                        filters: defaultStatsFilters,
                        cleanStatsFilters: {
                            agents: filteredAgents,
                        },
                    },
                },
                stats: initialStatsFiltersState,
            } as any as RootState

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
                agents: fromJS({all: fromJS(agents)}),
                ui: {
                    [agentPerformanceSlice.name]: {
                        sorting: {
                            ...initialState.sorting,
                            direction: OrderDirection.Asc,
                        },
                        pagination: {
                            currentPage,
                            perPage,
                        },
                    },
                    stats: initialUiStatsState,
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

    describe('getCleanStatsFiltersWithTimezone', () => {
        const defaultState = {
            currentUser: currentUserInitialState.mergeDeep(
                fromJS({
                    ...user,
                    _internal: {
                        loading: {
                            settings: {
                                preferences: true,
                            },
                            currentUser: true,
                        },
                    },
                })
            ),
            ui: {
                stats: initialUiStatsState,
            },
            stats: initialStatsFiltersState,
        } as RootState

        it('should return pageStatsFilters if no cleanStatsFilters are stored', () => {
            expect(
                getCleanStatsFiltersWithTimezone(defaultState).cleanStatsFilters
            ).toEqual(getPageStatsFilters(defaultState))
        })

        it('should return cleanStatsFilters filters if defined', () => {
            const cleanStatsFilters = {
                period: {
                    start_datetime: '1970-01-01T00:00:00+00:00',
                    end_datetime: '1970-01-01T00:00:00+00:00',
                },
                agents: [123, 456],
            }
            const state = {
                ...defaultState,
                ui: {
                    stats: {
                        ...initialUiStatsState,
                        cleanStatsFilters,
                    },
                },
            } as RootState
            expect(
                getCleanStatsFiltersWithTimezone(state).cleanStatsFilters
            ).toEqual(cleanStatsFilters)
        })

        it('should return user`s Timezone', () => {
            expect(
                getCleanStatsFiltersWithTimezone(defaultState).userTimezone
            ).toEqual(user.timezone)
        })

        it('should return default timezone if no user`s Timezone', () => {
            const state = {
                currentUser: currentUserInitialState.mergeDeep(
                    fromJS({
                        ...{...user, timezone: null},
                        _internal: {
                            loading: {
                                settings: {
                                    preferences: true,
                                },
                                currentUser: true,
                            },
                        },
                    })
                ),
                ui: {
                    stats: initialUiStatsState,
                },
                stats: initialStatsFiltersState,
            } as RootState

            expect(
                getCleanStatsFiltersWithTimezone(state).userTimezone
            ).toEqual(DEFAULT_TIMEZONE)
        })
    })
})
