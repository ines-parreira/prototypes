import {renderHook} from '@testing-library/react-hooks'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {
    TicketMessagesCube,
    TicketMessagesMeasure,
} from 'models/reporting/cubes/TicketMessagesCube'
import {getQuery} from 'pages/stats/TableConfig'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {opposite, OrderDirection} from 'models/api/types'
import {useSortingQuery} from 'hooks/reporting/useSortingQuery'
import {RootState, StoreDispatch} from 'state/types'
import {
    DEFAULT_SORTING_DIRECTION,
    initialState,
    sortingLoaded,
    sortingLoading,
    sortingSet,
} from 'state/ui/stats/agentPerformanceSlice'
import {initialState as filtersInitialState} from 'state/stats/reducers'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {TableColumn} from 'state/ui/stats/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('useSortingQueries', () => {
    const defaultState = {
        stats: filtersInitialState,
        ui: {
            agentPerformance: initialState,
            stats: uiStatsInitialState,
        },
    } as unknown as RootState

    const queryHook = jest.fn()

    beforeEach(() => {
        queryHook.mockReturnValue({
            isFetching: false,
            data: null,
            isError: false,
        })
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    describe('sorting callback', () => {
        it('should change the sorting column', () => {
            const store = mockStore(defaultState)
            const column = TableColumn.FirstResponseTime

            const {result} = renderHook(
                () => useSortingQuery(column, queryHook),
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
            const column = initialState.sorting.field

            const {result} = renderHook(
                () => useSortingQuery(column, queryHook),
                {
                    wrapper: ({children}) => (
                        <Provider store={store}>{children}</Provider>
                    ),
                }
            )

            result.current.sortCallback()

            const expectedSortingDirection = opposite(
                initialState.sorting.direction
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
        const column = TableColumn.ClosedTickets
        const metricData: MetricWithDecile<TicketMessagesCube>['data'] = {
            value: 123,
            decile: 5,
            allData: [{[TicketMessagesMeasure.FirstResponseTime]: '123'}],
        }
        const store = mockStore({
            ...defaultState,
            ui: {
                ...defaultState.ui,
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

        renderHook(() => useSortingQuery(column, queryHook), {
            wrapper: ({children}) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        expect(store.getActions()).toContainEqual(
            sortingLoaded(metricData.allData)
        )
    })

    it('should not dispatch query result on sorting isLoading and data is fetching', () => {
        const column = TableColumn.ClosedTickets
        const metricData: MetricWithDecile<TicketMessagesCube>['data'] = {
            value: 123,
            decile: 5,
            allData: [{[TicketMessagesMeasure.FirstResponseTime]: '123'}],
        }
        const store = mockStore({
            ...defaultState,
            ui: {
                ...defaultState.ui,
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

        renderHook(() => useSortingQuery(column, queryHook), {
            wrapper: ({children}) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        expect(store.getActions()).not.toContainEqual(
            sortingLoaded(metricData.allData)
        )
    })

    it('should disable loading when sorting by AgentName', () => {
        const column = TableColumn.AgentName
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
                stats: uiStatsInitialState,
            },
        } as unknown as RootState)

        renderHook(
            () => useSortingQuery(TableColumn.AgentName, getQuery(column)),
            {
                wrapper: ({children}) => (
                    <Provider store={store}>{children}</Provider>
                ),
            }
        )

        expect(store.getActions()).toContainEqual(sortingLoaded(null))
    })

    it('should update loading state when the query of a current sorting column starts loading', () => {
        const column = TableColumn.ClosedTickets
        const store = mockStore({
            ...defaultState,
            ui: {
                agentPerformance: {
                    ...initialState,
                    sorting: {
                        field: column,
                        direction: OrderDirection.Asc,
                        isLoading: false,
                    },
                },
                stats: uiStatsInitialState,
            },
        } as unknown as RootState)
        queryHook.mockReturnValue({
            ...defaultState,
            isFetching: true,
        })

        renderHook(() => useSortingQuery(column, queryHook), {
            wrapper: ({children}) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        expect(store.getActions()).toContainEqual(sortingLoading())
    })
})
