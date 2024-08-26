import {renderHook} from '@testing-library/react-hooks'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {mockFlags} from 'jest-launchdarkly-mock'
import {CHANNEL_DIMENSION} from 'models/reporting/queryFactories/support-performance/constants'
import {TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {useChannelsSortingQuery} from 'hooks/reporting/support-performance/useChannelsSortingQuery'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketSatisfactionSurveyMeasure} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {
    ChannelColumnConfig,
    ChannelsTableColumns,
} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {TicketMessagesCube} from 'models/reporting/cubes/TicketMessagesCube'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {opposite, OrderDirection} from 'models/api/types'
import {RootState, StoreDispatch} from 'state/types'
import {
    initialState,
    sortingLoaded,
    sortingLoading,
    sortingSet,
    channelsSlice,
} from 'state/ui/stats/channelsSlice'
import {initialState as filtersInitialState} from 'state/stats/statsSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {notEmpty} from 'utils'
import {FeatureFlagKey} from 'config/featureFlags'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('useChannelsSortingQuery', () => {
    const mockedChannels = ['a', 'b']
    const mockedTags = [1, 2]
    const defaultState = {
        stats: filtersInitialState,
        ui: {
            [channelsSlice.name]: initialState,
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
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFilters]: false,
        })
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    describe('sorting callback', () => {
        it('should change the sorting column', () => {
            const store = mockStore(defaultState)
            const column = ChannelsTableColumns.CustomerSatisfaction

            const {result} = renderHook(
                () => useChannelsSortingQuery(column, queryHook),
                {
                    wrapper: ({children}) => (
                        <Provider store={store}>{children}</Provider>
                    ),
                }
            )

            result.current.sortCallback()

            expect(store.getActions()).toContainEqual(
                sortingSet({
                    direction: OrderDirection.Desc,
                    field: column,
                })
            )
        })

        it('should flip the sorting direction on second call with same column', () => {
            const store = mockStore(defaultState)
            const column = initialState.sorting.field

            const {result} = renderHook(
                () => useChannelsSortingQuery(column, queryHook),
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
        const column = ChannelsTableColumns.CustomerSatisfaction
        const metricData: MetricWithDecile<HelpdeskMessageCubeWithJoins>['data'] =
            {
                value: 123,
                decile: 5,
                allData: [
                    {
                        [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '123',
                        [CHANNEL_DIMENSION]: 'whatsapp',
                    },
                ],
            }
        const store = mockStore({
            ...defaultState,
            ui: {
                ...defaultState.ui,
                [channelsSlice.name]: {
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

        renderHook(() => useChannelsSortingQuery(column, queryHook), {
            wrapper: ({children}) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        expect(store.getActions()).toContainEqual(
            sortingLoaded(
                metricData.allData
                    .map((result) => result[CHANNEL_DIMENSION])
                    .filter(notEmpty)
            )
        )
    })

    it('should dispatch empty array on empty query result on sorting isLoading and data fetched', () => {
        const column = ChannelsTableColumns.CustomerSatisfaction
        const store = mockStore({
            ...defaultState,
            ui: {
                ...defaultState.ui,
                [channelsSlice.name]: {
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
            data: undefined,
            isError: false,
        })

        renderHook(() => useChannelsSortingQuery(column, queryHook), {
            wrapper: ({children}) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        expect(store.getActions()).toContainEqual(sortingLoaded([]))
    })

    it('should not dispatch query result on sorting isLoading and data is fetching', () => {
        const column = ChannelsTableColumns.ClosedTickets
        const metricData: MetricWithDecile<TicketMessagesCube>['data'] = {
            value: 123,
            decile: 5,
            allData: [
                {
                    [TicketMeasure.TicketCount]: '123',
                    [CHANNEL_DIMENSION]: 'whatsapp',
                },
            ],
        }
        const store = mockStore({
            ...defaultState,
            ui: {
                ...defaultState.ui,
                [channelsSlice.name]: {
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

        renderHook(() => useChannelsSortingQuery(column, queryHook), {
            wrapper: ({children}) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        expect(store.getActions()).not.toContainEqual(
            sortingLoaded(
                metricData.allData
                    .map((result) => result[CHANNEL_DIMENSION])
                    .filter(notEmpty)
            )
        )
    })

    it('should disable loading when sorting by Channel', () => {
        const column = ChannelsTableColumns.Channel
        const store = mockStore({
            ...defaultState,
            ui: {
                [channelsSlice.name]: {
                    ...initialState,
                    sorting: {
                        field: column,
                        direction: OrderDirection.Asc,
                        isLoading: true,
                        lastSortingMetric: null,
                    },
                },
                stats: uiStatsInitialState,
            },
        } as unknown as RootState)

        renderHook(
            () =>
                useChannelsSortingQuery(
                    column,
                    ChannelColumnConfig[column].useMetric
                ),
            {
                wrapper: ({children}) => (
                    <Provider store={store}>{children}</Provider>
                ),
            }
        )

        expect(store.getActions()).toContainEqual(sortingLoaded([]))
    })

    it('should update loading state when the query of a current sorting column starts loading', () => {
        const column = ChannelsTableColumns.ClosedTickets
        const store = mockStore({
            ...defaultState,
            ui: {
                [channelsSlice.name]: {
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

        renderHook(() => useChannelsSortingQuery(column, queryHook), {
            wrapper: ({children}) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        expect(store.getActions()).toContainEqual(sortingLoading())
    })

    it('should check that queryHook was called with legacy filters', () => {
        const state = {
            stats: {
                filters: {
                    ...filtersInitialState.filters,
                    tags: withDefaultLogicalOperator(mockedTags),
                    channels: withDefaultLogicalOperator(mockedChannels),
                },
            },
            ui: {
                [channelsSlice.name]: initialState,
                stats: uiStatsInitialState,
            },
        } as RootState
        const store = mockStore(state)
        const column = ChannelsTableColumns.CustomerSatisfaction

        renderHook(() => useChannelsSortingQuery(column, queryHook), {
            wrapper: ({children}) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        expect(queryHook).toHaveBeenCalledWith(
            expect.objectContaining({
                tags: mockedTags,
                channels: mockedChannels,
            }),
            expect.anything(),
            expect.anything()
        )
    })

    it('should check that queryHook was called with stats filters with logical operator', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFilters]: true,
        })

        const state = {
            stats: {
                filters: {
                    ...filtersInitialState.filters,
                    tags: withDefaultLogicalOperator(mockedTags),
                    channels: withDefaultLogicalOperator(mockedChannels),
                },
            },
            ui: {
                [channelsSlice.name]: initialState,
                stats: uiStatsInitialState,
            },
        } as RootState
        const store = mockStore(state)
        const column = ChannelsTableColumns.CustomerSatisfaction

        renderHook(() => useChannelsSortingQuery(column, queryHook), {
            wrapper: ({children}) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        expect(queryHook).toHaveBeenCalledWith(
            expect.objectContaining({
                tags: withDefaultLogicalOperator(mockedTags),
                channels: withDefaultLogicalOperator(mockedChannels),
            }),
            expect.anything(),
            expect.anything()
        )
    })
})
