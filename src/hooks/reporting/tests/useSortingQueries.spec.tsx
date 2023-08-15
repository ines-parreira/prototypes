import {renderHook} from '@testing-library/react-hooks'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Metric} from 'hooks/reporting/useMetricPerDimension'
import {
    useClosedTicketsMetricPerAgent,
    useCustomerSatisfactionMetricPerAgent,
    useFirstResponseTimeMetricPerAgent,
    useMessagesSentMetricPerAgent,
    useResolutionTimeMetricPerAgent,
    useTicketsRepliedMetricPerAgent,
} from 'hooks/reporting/metricsPerDimension'
import {opposite, OrderDirection} from 'models/api/types'
import {useSortingQueries} from 'hooks/reporting/useSortingQueries'
import {RootState, StoreDispatch} from 'state/types'
import {
    initialState,
    sortingLoaded,
    sortingSet,
} from 'state/ui/stats/agentPerformanceSlice'
import {initialState as filtersInitialState} from 'state/stats/reducers'
import {TableColumn} from 'state/ui/stats/types'
import {assumeMock} from 'utils/testing'
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('hooks/reporting/metricsPerDimension')
const useFirstResponseTimeMetricPerAgentMock = assumeMock(
    useFirstResponseTimeMetricPerAgent
)
const useTicketsRepliedMetricPerAgentMock = assumeMock(
    useTicketsRepliedMetricPerAgent
)
const useClosedTicketsMetricPerAgentMock = assumeMock(
    useClosedTicketsMetricPerAgent
)
const useMessagesSentMetricPerAgentMock = assumeMock(
    useMessagesSentMetricPerAgent
)
const useCustomerSatisfactionMetricPerAgentMock = assumeMock(
    useCustomerSatisfactionMetricPerAgent
)
const useResolutionTimeMetricPerAgentMock = assumeMock(
    useResolutionTimeMetricPerAgent
)

const initialMetricHookState = {
    isFetching: false,
    data: null,
    isError: false,
}

describe('useSortingQueries', () => {
    const defaultState = {
        stats: filtersInitialState,
        ui: {
            agentPerformance: initialState,
        },
    } as unknown as RootState

    beforeEach(() => {
        useFirstResponseTimeMetricPerAgentMock.mockReturnValue(
            initialMetricHookState
        )
        useTicketsRepliedMetricPerAgentMock.mockReturnValue(
            initialMetricHookState
        )
        useClosedTicketsMetricPerAgentMock.mockReturnValue(
            initialMetricHookState
        )
        useMessagesSentMetricPerAgentMock.mockReturnValue(
            initialMetricHookState
        )
        useCustomerSatisfactionMetricPerAgentMock.mockReturnValue(
            initialMetricHookState
        )
        useResolutionTimeMetricPerAgentMock.mockReturnValue(
            initialMetricHookState
        )
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    it('should return a sorting callback that dispatches sortingSet action in opposite direction', () => {
        const store = mockStore(defaultState)
        const column = TableColumn.AgentName

        const {result} = renderHook(() => useSortingQueries(column), {
            wrapper: ({children}) => (
                <Provider store={store}>{children}</Provider>
            ),
        })
        result.current.sortCallback()

        expect(result.current.direction).toEqual(initialState.sorting.direction)
        expect(store.getActions()).toContainEqual(
            sortingSet({
                direction: opposite(initialState.sorting.direction),
                field: initialState.sorting.field,
            })
        )
    })

    const sortableMetrics = [
        {
            column: TableColumn.FirstResponseTime,
            queryHook: useFirstResponseTimeMetricPerAgentMock,
        },
        {
            column: TableColumn.MessagesSent,
            queryHook: useMessagesSentMetricPerAgentMock,
        },
        {
            column: TableColumn.ClosedTickets,
            queryHook: useClosedTicketsMetricPerAgentMock,
        },
        {
            column: TableColumn.PercentageOfClosedTickets,
            queryHook: useClosedTicketsMetricPerAgentMock,
        },
        {
            column: TableColumn.RepliedTickets,
            queryHook: useTicketsRepliedMetricPerAgentMock,
        },
        {
            column: TableColumn.CustomerSatisfaction,
            queryHook: useCustomerSatisfactionMetricPerAgentMock,
        },
        {
            column: TableColumn.ResolutionTime,
            queryHook: useResolutionTimeMetricPerAgentMock,
        },
    ]

    it.each(sortableMetrics)(
        'should dispatch query result on sorting isLoading and data fetched',
        ({column, queryHook}) => {
            const metricData: Metric['data'] = {
                value: 123,
                allData: [{someDimension: 123}],
            }
            const store = mockStore({
                ...defaultState,
                ui: {
                    agentPerformance: {
                        ...initialState,
                        sorting: {
                            field: column,
                            direction: OrderDirection.Asc,
                            isLoading: true,
                        },
                    },
                },
            } as unknown as RootState)
            queryHook.mockReturnValue({
                isFetching: false,
                data: metricData,
                isError: false,
            })

            renderHook(() => useSortingQueries(column), {
                wrapper: ({children}) => (
                    <Provider store={store}>{children}</Provider>
                ),
            })

            expect(store.getActions()).toContainEqual(
                sortingLoaded(metricData.allData)
            )
        }
    )

    it.each(sortableMetrics)(
        'should not dispatch query result on sorting isLoading and data is fetching',
        ({column, queryHook}) => {
            const metricData: Metric['data'] = {
                value: 123,
                allData: [{someDimension: 123}],
            }
            const store = mockStore({
                ...defaultState,
                ui: {
                    agentPerformance: {
                        ...initialState,
                        sorting: {
                            field: column,
                            direction: OrderDirection.Asc,
                            isLoading: true,
                        },
                    },
                },
            } as unknown as RootState)
            queryHook.mockReturnValue({
                isFetching: true,
                data: metricData,
                isError: false,
            })

            renderHook(() => useSortingQueries(column), {
                wrapper: ({children}) => (
                    <Provider store={store}>{children}</Provider>
                ),
            })

            expect(store.getActions().length).toEqual(0)
        }
    )

    it('should disable loading when sorting by AgentName', () => {
        const store = mockStore({
            ...defaultState,
            ui: {
                agentPerformance: {
                    ...initialState,
                    sorting: {
                        field: TableColumn.AgentName,
                        direction: OrderDirection.Asc,
                        isLoading: true,
                    },
                },
            },
        } as unknown as RootState)

        renderHook(() => useSortingQueries(TableColumn.AgentName), {
            wrapper: ({children}) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        expect(store.getActions()).toContainEqual(sortingLoaded(null))
    })
})
