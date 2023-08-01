import {fromJS} from 'immutable'
import {
    TicketDimension,
    TicketMeasure,
    TicketMember,
} from 'models/reporting/types'
import {OrderDirection} from 'models/api/types'
import {
    initialState,
    agentPerformanceSlice,
    selectAgentSorting,
    sortingSet,
    sortingLoaded,
    selectSortedAgents,
    selectSortingMetricIsLoading,
} from 'state/ui/stats/agentPerformanceSlice'
import {RootState} from 'state/types'
import {TableColumn} from 'state/ui/stats/types'

describe('agentPerformanceSlice', () => {
    const agents = [
        {id: 1, name: 'Adam'},
        {id: 2, name: 'Zoey'},
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
            })
        })

        it('should keep lastSortingMetric and disable isLoading on sortingLoaded action', () => {
            const loadingState = {
                sorting: {
                    ...initialState.sorting,
                    isLoading: true,
                },
                lastSortingMetric: null,
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
                sorting: {...initialState.sorting, isLoading: false},
                lastSortingMetric: metricData,
            })
        })
    })

    describe('selectAgentSorting', () => {
        it('should return the current sorting', () => {
            const state = {
                ui: {[agentPerformanceSlice.name]: initialState},
            } as RootState

            expect(selectAgentSorting(state)).toEqual(initialState.sorting)
        })
    })

    describe('selectSortingMetricIsLoading', () => {
        it('should return the loading state of current sorting', () => {
            const state = {
                ui: {[agentPerformanceSlice.name]: initialState},
            } as RootState

            expect(selectSortingMetricIsLoading(state)).toEqual(
                initialState.sorting.isLoading
            )
        })
    })

    describe('selectSortedAgents', () => {
        it('should return agents if no sorting metric is declared', () => {
            const state = {
                agents: fromJS({all: fromJS(agents)}),
                ui: {[agentPerformanceSlice.name]: initialState},
            } as RootState

            expect(selectSortedAgents(state)).toEqual(agents)
        })

        it('should return agents in descending order', () => {
            const state = {
                agents: fromJS({all: fromJS(agents)}),
                ui: {
                    [agentPerformanceSlice.name]: {
                        sorting: {
                            field: TableColumn.AgentName,
                            direction: OrderDirection.Desc,
                            isLoading: false,
                        },
                        lastSortingMetric: null,
                    },
                },
            } as RootState

            expect(selectSortedAgents(state)).toEqual([...agents].reverse())
        })

        it('should return agents if no sorting metric is declared', () => {
            const state = {
                agents: fromJS({all: fromJS(agents)}),
                ui: {[agentPerformanceSlice.name]: initialState},
            } as RootState

            expect(selectSortedAgents(state)).toEqual(agents)
        })

        it('should return agents sorted by selected metric', () => {
            const metricData = [
                {
                    [TicketMember.AssigneeUserId]: '2',
                    [TicketMeasure.FirstResponseTime]: '10',
                },
                {
                    [TicketMember.AssigneeUserId]: '1',
                    [TicketMeasure.FirstResponseTime]: '5',
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
                        },
                        lastSortingMetric: metricData,
                    },
                },
            } as RootState

            expect(selectSortedAgents(state)).toEqual([agents[1], agents[0]])
        })

        it('should return agents with no data last', () => {
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
                        },
                        lastSortingMetric: metricData,
                    },
                },
            } as RootState

            expect(selectSortedAgents(state).pop()).toEqual(agents[0])
        })
    })
})
