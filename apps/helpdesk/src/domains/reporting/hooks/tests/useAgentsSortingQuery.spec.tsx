import React from 'react'

import { renderHook } from '@repo/testing'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useAgentsSortingQuery } from 'domains/reporting/hooks/useAgentsSortingQuery'
import type { MetricWithDecile } from 'domains/reporting/hooks/useMetricPerDimension'
import type { TicketMessagesCube } from 'domains/reporting/models/cubes/TicketMessagesCube'
import { TicketMessagesMeasure } from 'domains/reporting/models/cubes/TicketMessagesCube'
import { getQuery } from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import { initialState as filtersInitialState } from 'domains/reporting/state/stats/statsSlice'
import {
    agentPerformance,
    DEFAULT_SORTING_DIRECTION,
    initialState,
    sortingLoaded,
    sortingLoading,
    sortingSet,
} from 'domains/reporting/state/ui/stats/agentPerformanceSlice'
import { AGENT_PERFORMANCE_SLICE_NAME } from 'domains/reporting/state/ui/stats/constants'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { AgentsTableColumn } from 'domains/reporting/state/ui/stats/types'
import { opposite, OrderDirection } from 'models/api/types'
import type { RootState, StoreDispatch } from 'state/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('useAgentsSortingQuery', () => {
    const statsFilters = {
        cleanStatsFilters: filtersInitialState.filters,
        userTimezone: 'UTC',
    }
    const defaultState = {
        stats: filtersInitialState,
        ui: {
            stats: {
                statsTables: {
                    [AGENT_PERFORMANCE_SLICE_NAME]: initialState,
                },
                filters: uiStatsInitialState,
            },
        },
    } as RootState

    const queryHook = jest.fn()

    beforeEach(() => {
        queryHook.mockReturnValue({
            isFetching: false,
            data: null,
            isError: false,
        })
    })

    describe('sorting callback', () => {
        it('should change the sorting column', () => {
            const store = mockStore(defaultState)
            const column = AgentsTableColumn.MedianFirstResponseTime

            const { result } = renderHook(
                () =>
                    useAgentsSortingQuery(
                        column,
                        queryHook,
                        statsFilters,
                        agentPerformance,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={store}>{children}</Provider>
                    ),
                },
            )

            result.current.sortCallback()

            expect(store.getActions()).toContainEqual(
                sortingSet({
                    direction: DEFAULT_SORTING_DIRECTION,
                    field: column,
                }),
            )
        })

        it('should flip the sorting direction on second call with same column', () => {
            const store = mockStore(defaultState)
            const column = initialState.sorting.field

            const { result } = renderHook(
                () =>
                    useAgentsSortingQuery(
                        column,
                        queryHook,
                        statsFilters,
                        agentPerformance,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={store}>{children}</Provider>
                    ),
                },
            )

            result.current.sortCallback()

            const expectedSortingDirection = opposite(
                initialState.sorting.direction,
            )

            expect(store.getActions()).toContainEqual(
                sortingSet({
                    direction: expectedSortingDirection,
                    field: column,
                }),
            )
        })
    })

    it('should dispatch query result on sorting isLoading and data fetched', () => {
        const column = AgentsTableColumn.ClosedTickets
        const metricData: MetricWithDecile<TicketMessagesCube>['data'] = {
            value: 123,
            decile: 5,
            allData: [
                { [TicketMessagesMeasure.MedianFirstResponseTime]: '123' },
            ],
        }
        const store = mockStore({
            ...defaultState,
            ui: {
                stats: {
                    ...defaultState.ui.stats,
                    statsTables: {
                        [AGENT_PERFORMANCE_SLICE_NAME]: {
                            sorting: {
                                field: column,
                                direction: OrderDirection.Asc,
                                isLoading: true,
                            },
                        },
                    },
                },
            },
        } as RootState)
        queryHook.mockReturnValue({
            isFetching: false,
            data: metricData,
            isError: false,
        })

        renderHook(
            () =>
                useAgentsSortingQuery(
                    column,
                    queryHook,
                    statsFilters,
                    agentPerformance,
                ),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )

        expect(store.getActions()).toContainEqual(
            sortingLoaded(metricData.allData),
        )
    })

    it('should not dispatch query result on sorting isLoading and data is fetching', () => {
        const column = AgentsTableColumn.ClosedTickets
        const metricData: MetricWithDecile<TicketMessagesCube>['data'] = {
            value: 123,
            decile: 5,
            allData: [
                { [TicketMessagesMeasure.MedianFirstResponseTime]: '123' },
            ],
        }
        const store = mockStore({
            ...defaultState,
            ui: {
                ...defaultState.ui,
                statsAgents: {
                    [AGENT_PERFORMANCE_SLICE_NAME]: {
                        ...initialState,
                        sorting: {
                            field: column,
                            direction: OrderDirection.Asc,
                            isLoading: true,
                        },
                    },
                },
            },
        } as RootState)
        queryHook.mockReturnValue({
            isFetching: true,
            data: metricData,
            isError: false,
        })

        renderHook(
            () =>
                useAgentsSortingQuery(
                    column,
                    queryHook,
                    statsFilters,
                    agentPerformance,
                ),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )

        expect(store.getActions()).not.toContainEqual(
            sortingLoaded(metricData.allData),
        )
    })

    it('should disable loading when sorting by AgentName', () => {
        const column = AgentsTableColumn.AgentName
        const store = mockStore({
            ...defaultState,
            ui: {
                stats: {
                    statsTables: {
                        [AGENT_PERFORMANCE_SLICE_NAME]: {
                            ...initialState,
                            sorting: {
                                field: column,
                                direction: OrderDirection.Asc,
                                isLoading: true,
                            },
                        },
                    },
                    filters: uiStatsInitialState,
                },
            },
        } as RootState)

        renderHook(
            () =>
                useAgentsSortingQuery(
                    AgentsTableColumn.AgentName,
                    getQuery(column),
                    statsFilters,
                    agentPerformance,
                ),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )

        expect(store.getActions()).toContainEqual(sortingLoaded(null))
    })

    it('should update loading state when the query of a current sorting column starts loading', () => {
        const column = AgentsTableColumn.ClosedTickets
        const store = mockStore({
            ...defaultState,
            ui: {
                stats: {
                    filters: uiStatsInitialState,
                    statsTables: {
                        [AGENT_PERFORMANCE_SLICE_NAME]: {
                            ...initialState,
                            sorting: {
                                field: column,
                                direction: OrderDirection.Asc,
                                isLoading: false,
                            },
                        },
                    },
                },
            },
        } as RootState)
        queryHook.mockReturnValue({
            ...defaultState,
            isFetching: true,
        })

        renderHook(
            () =>
                useAgentsSortingQuery(
                    column,
                    queryHook,
                    statsFilters,
                    agentPerformance,
                ),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )

        expect(store.getActions()).toContainEqual(sortingLoading())
    })
})
