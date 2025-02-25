import React from 'react'

import { renderHook } from '@testing-library/react-hooks'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { FeatureFlagKey } from 'config/featureFlags'
import { useChannelsSortingQuery } from 'hooks/reporting/support-performance/useChannelsSortingQuery'
import { MetricWithDecile } from 'hooks/reporting/useMetricPerDimension'
import { opposite, OrderDirection } from 'models/api/types'
import { HelpdeskMessageCubeWithJoins } from 'models/reporting/cubes/HelpdeskMessageCube'
import { TicketMeasure } from 'models/reporting/cubes/TicketCube'
import { TicketMessagesCube } from 'models/reporting/cubes/TicketMessagesCube'
import { TicketSatisfactionSurveyMeasure } from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import { CHANNEL_DIMENSION } from 'models/reporting/queryFactories/support-performance/constants'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { TagFilterInstanceId } from 'models/stat/types'
import { ChannelColumnConfig } from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import { initialState as filtersInitialState } from 'state/stats/statsSlice'
import { RootState, StoreDispatch } from 'state/types'
import {
    channelsSlice,
    initialState,
    sortingLoaded,
    sortingLoading,
    sortingSet,
} from 'state/ui/stats/channelsSlice'
import { initialState as uiFiltersInitialState } from 'state/ui/stats/filtersSlice'
import { ChannelsTableColumns } from 'state/ui/stats/types'
import { notEmpty } from 'utils'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('useChannelsSortingQuery', () => {
    const mockedChannels = ['a', 'b']
    const mockedTags = [1, 2]
    const defaultState = {
        stats: filtersInitialState,
        ui: {
            stats: {
                [channelsSlice.name]: initialState,
                filters: uiFiltersInitialState,
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

            const { result } = renderHook(
                () => useChannelsSortingQuery(column, queryHook),
                {
                    wrapper: ({ children }) => (
                        <Provider store={store}>{children}</Provider>
                    ),
                },
            )

            result.current.sortCallback()

            expect(store.getActions()).toContainEqual(
                sortingSet({
                    direction: OrderDirection.Desc,
                    field: column,
                }),
            )
        })

        it('should flip the sorting direction on second call with same column', () => {
            const store = mockStore(defaultState)
            const column = initialState.sorting.field

            const { result } = renderHook(
                () => useChannelsSortingQuery(column, queryHook),
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
                stats: {
                    ...defaultState.ui.stats,
                    [channelsSlice.name]: {
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
            isFetching: false,
            data: metricData,
            isError: false,
        })

        renderHook(() => useChannelsSortingQuery(column, queryHook), {
            wrapper: ({ children }) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        expect(store.getActions()).toContainEqual(
            sortingLoaded(
                metricData.allData
                    .map((result) => result[CHANNEL_DIMENSION])
                    .filter(notEmpty),
            ),
        )
    })

    it('should dispatch empty array on empty query result on sorting isLoading and data fetched', () => {
        const column = ChannelsTableColumns.CustomerSatisfaction
        const store = mockStore({
            ...defaultState,
            ui: {
                stats: {
                    ...defaultState.ui.stats,
                    [channelsSlice.name]: {
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
            isFetching: false,
            data: undefined,
            isError: false,
        })

        renderHook(() => useChannelsSortingQuery(column, queryHook), {
            wrapper: ({ children }) => (
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
                stats: {
                    ...defaultState.ui.stats,
                    [channelsSlice.name]: {
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

        renderHook(() => useChannelsSortingQuery(column, queryHook), {
            wrapper: ({ children }) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        expect(store.getActions()).not.toContainEqual(
            sortingLoaded(
                metricData.allData
                    .map((result) => result[CHANNEL_DIMENSION])
                    .filter(notEmpty),
            ),
        )
    })

    it('should disable loading when sorting by Channel', () => {
        const column = ChannelsTableColumns.Channel
        const store = mockStore({
            ...defaultState,
            ui: {
                stats: {
                    [channelsSlice.name]: {
                        ...initialState,
                        sorting: {
                            field: column,
                            direction: OrderDirection.Asc,
                            isLoading: true,
                            lastSortingMetric: null,
                        },
                    },
                    filters: uiFiltersInitialState,
                },
            },
        } as RootState)

        renderHook(
            () =>
                useChannelsSortingQuery(
                    column,
                    ChannelColumnConfig[column].useMetric,
                ),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )

        expect(store.getActions()).toContainEqual(sortingLoaded([]))
    })

    it('should update loading state when the query of a current sorting column starts loading', () => {
        const column = ChannelsTableColumns.ClosedTickets
        const store = mockStore({
            ...defaultState,
            ui: {
                stats: {
                    [channelsSlice.name]: {
                        ...initialState,
                        sorting: {
                            field: column,
                            direction: OrderDirection.Asc,
                            isLoading: false,
                        },
                    },
                    filters: uiFiltersInitialState,
                },
            },
        } as RootState)
        queryHook.mockReturnValue({
            ...defaultState,
            isFetching: true,
        })

        renderHook(() => useChannelsSortingQuery(column, queryHook), {
            wrapper: ({ children }) => (
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
                    tags: [
                        {
                            ...withDefaultLogicalOperator(mockedTags),
                            filterInstanceId: TagFilterInstanceId.First,
                        },
                    ],
                    channels: withDefaultLogicalOperator(mockedChannels),
                },
            },
            ui: {
                stats: {
                    [channelsSlice.name]: initialState,
                    filters: uiFiltersInitialState,
                },
            },
        } as RootState
        const store = mockStore(state)
        const column = ChannelsTableColumns.CustomerSatisfaction

        renderHook(() => useChannelsSortingQuery(column, queryHook), {
            wrapper: ({ children }) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        expect(queryHook).toHaveBeenCalledWith(
            expect.objectContaining({
                tags: mockedTags,
                channels: mockedChannels,
            }),
            expect.anything(),
            expect.anything(),
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
                    tags: [
                        {
                            ...withDefaultLogicalOperator(mockedTags),
                            filterInstanceId: TagFilterInstanceId.First,
                        },
                    ],
                    channels: withDefaultLogicalOperator(mockedChannels),
                },
            },
            ui: {
                stats: {
                    [channelsSlice.name]: initialState,
                    filters: uiFiltersInitialState,
                },
            },
        } as RootState
        const store = mockStore(state)
        const column = ChannelsTableColumns.CustomerSatisfaction

        renderHook(() => useChannelsSortingQuery(column, queryHook), {
            wrapper: ({ children }) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        expect(queryHook).toHaveBeenCalledWith(
            expect.objectContaining({
                tags: [
                    {
                        ...withDefaultLogicalOperator(mockedTags),
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                ],
                channels: withDefaultLogicalOperator(mockedChannels),
            }),
            expect.anything(),
            expect.anything(),
        )
    })
})
