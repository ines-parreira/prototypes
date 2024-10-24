import {renderHook} from '@testing-library/react-hooks'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {useAutoQAAgentsSortingQuery} from 'hooks/reporting/useAutoQAAgentsSortingQuery'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {opposite, OrderDirection} from 'models/api/types'
import {TicketQAScoreMeasure} from 'models/reporting/cubes/auto-qa/TicketQAScoreCube'
import {TicketMessagesCube} from 'models/reporting/cubes/TicketMessagesCube'
import {
    AutoQAAgentsTableColumn,
    getQuery,
} from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTableConfig'
import {initialState as filtersInitialState} from 'state/stats/statsSlice'
import {RootState, StoreDispatch} from 'state/types'
import {DEFAULT_SORTING_DIRECTION} from 'state/ui/stats/agentPerformanceSlice'
import {
    initialState as autoQAInitialState,
    sortingLoaded,
    sortingLoading,
    sortingSet,
} from 'state/ui/stats/autoQAAgentPerformanceSlice'
import {AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME} from 'state/ui/stats/constants'
import {initialState as uiStatsInitialState} from 'state/ui/stats/filtersSlice'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('useAgentsSortingQuery', () => {
    const defaultState = {
        stats: filtersInitialState,
        ui: {
            stats: {
                statsTables: {
                    [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]: autoQAInitialState,
                },
                filters: uiStatsInitialState,
            },
        },
    } as RootState
    const column = AutoQAAgentsTableColumn.ResolutionCompleteness
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
            const column = AutoQAAgentsTableColumn.ResolutionCompleteness

            const {result} = renderHook(
                () => useAutoQAAgentsSortingQuery(column, queryHook),
                {
                    wrapper: ({children}) => (
                        <Provider store={store}>{children}</Provider>
                    ),
                }
            )

            result.current.sortCallback()

            expect(store.getActions()).toContainEqual(
                sortingSet({
                    direction: DEFAULT_SORTING_DIRECTION,
                    field: column,
                })
            )
        })

        it('should flip the sorting direction on second call with same column', () => {
            const store = mockStore(defaultState)
            const column = autoQAInitialState.sorting.field

            const {result} = renderHook(
                () => useAutoQAAgentsSortingQuery(column, queryHook),
                {
                    wrapper: ({children}) => (
                        <Provider store={store}>{children}</Provider>
                    ),
                }
            )

            result.current.sortCallback()

            const expectedSortingDirection = opposite(
                autoQAInitialState.sorting.direction
            )

            expect(store.getActions()).toContainEqual(
                sortingSet({
                    direction: expectedSortingDirection,
                    field: column,
                })
            )
        })
    })

    it('should dispatch query result on sorting isLoading and data fetched', () => {
        const metricData: MetricWithDecile<TicketMessagesCube>['data'] = {
            value: 123,
            decile: 5,
            allData: [{[TicketQAScoreMeasure.AverageScore]: '123'}],
        }
        const store = mockStore({
            ...defaultState,
            ui: {
                stats: {
                    ...defaultState.ui.stats,
                    statsTables: {
                        [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]: {
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

        renderHook(() => useAutoQAAgentsSortingQuery(column, queryHook), {
            wrapper: ({children}) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        expect(store.getActions()).toContainEqual(
            sortingLoaded(metricData.allData)
        )
    })

    it('should not dispatch query result on sorting isLoading and data is fetching', () => {
        const metricData: MetricWithDecile<TicketMessagesCube>['data'] = {
            value: 123,
            decile: 5,
            allData: [{[TicketQAScoreMeasure.AverageScore]: '123'}],
        }
        const store = mockStore({
            ...defaultState,
            ui: {
                ...defaultState.ui,
                statsAgents: {
                    [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]: {
                        ...autoQAInitialState,
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

        renderHook(() => useAutoQAAgentsSortingQuery(column, queryHook), {
            wrapper: ({children}) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        expect(store.getActions()).not.toContainEqual(
            sortingLoaded(metricData.allData)
        )
    })

    it('should disable loading when sorting by AgentName', () => {
        const agentNameColumn = AutoQAAgentsTableColumn.AgentName
        const store = mockStore({
            ...defaultState,
            ui: {
                stats: {
                    filters: uiStatsInitialState,
                    statsTables: {
                        [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]: {
                            ...autoQAInitialState,
                            sorting: {
                                field: agentNameColumn,
                                direction: OrderDirection.Asc,
                                isLoading: true,
                            },
                        },
                    },
                },
            },
        } as RootState)

        renderHook(
            () =>
                useAutoQAAgentsSortingQuery(
                    agentNameColumn,
                    getQuery(agentNameColumn)
                ),
            {
                wrapper: ({children}) => (
                    <Provider store={store}>{children}</Provider>
                ),
            }
        )

        expect(store.getActions()).toContainEqual(sortingLoaded(null))
    })

    it('should update loading state when the query of a current sorting column starts loading', () => {
        const store = mockStore({
            ...defaultState,
            ui: {
                stats: {
                    filters: uiStatsInitialState,
                    statsTables: {
                        [AUTO_QA_AGENT_PERFORMANCE_SLICE_NAME]: {
                            ...autoQAInitialState,
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

        renderHook(() => useAutoQAAgentsSortingQuery(column, queryHook), {
            wrapper: ({children}) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        expect(store.getActions()).toContainEqual(sortingLoading())
    })
})
