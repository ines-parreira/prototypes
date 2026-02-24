import React from 'react'

import { renderHook } from '@repo/testing'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { MetricWithDecile } from 'domains/reporting/hooks/types'
import { useAgentAvailabilitySortingQuery } from 'domains/reporting/hooks/useAgentAvailabilitySortingQuery'
import type { Cubes } from 'domains/reporting/models/cubes'
import { AGENT_AVAILABILITY_COLUMNS } from 'domains/reporting/pages/support-performance/agents/constants'
import { initialState as filtersInitialState } from 'domains/reporting/state/stats/statsSlice'
import {
    agentAvailability,
    initialState,
} from 'domains/reporting/state/ui/stats/agentAvailabilitySlice'
import { AGENT_AVAILABILITY_SLICE_NAME } from 'domains/reporting/state/ui/stats/constants'
import { DEFAULT_SORTING_DIRECTION } from 'domains/reporting/state/ui/stats/createTableSlice'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { opposite, OrderDirection } from 'models/api/types'
import type { RootState, StoreDispatch } from 'state/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const { ONLINE_TIME_COLUMN } = AGENT_AVAILABILITY_COLUMNS

describe('useAgentAvailabilitySortingQuery', () => {
    const statsFilters = {
        cleanStatsFilters: filtersInitialState.filters,
        userTimezone: 'UTC',
    }
    const defaultState = {
        stats: filtersInitialState,
        ui: {
            stats: {
                statsTables: {
                    [AGENT_AVAILABILITY_SLICE_NAME]: initialState,
                },
                filters: uiStatsInitialState,
            },
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

    describe('sorting callback', () => {
        it('should change the sorting column', () => {
            const store = mockStore(defaultState)
            const column = ONLINE_TIME_COLUMN

            const { result } = renderHook(
                () =>
                    useAgentAvailabilitySortingQuery(
                        column,
                        queryHook,
                        statsFilters,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={store}>{children}</Provider>
                    ),
                },
            )

            result.current.sortCallback()

            expect(store.getActions()).toContainEqual(
                agentAvailability.actions.sortingSet({
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
                    useAgentAvailabilitySortingQuery(
                        column,
                        queryHook,
                        statsFilters,
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
                agentAvailability.actions.sortingSet({
                    direction: expectedSortingDirection,
                    field: column,
                }),
            )
        })
    })

    it('should dispatch query result on sorting isLoading and data fetched', () => {
        const column = ONLINE_TIME_COLUMN
        const metricData: MetricWithDecile<number, Cubes>['data'] = {
            value: 123,
            decile: 5,
            allData: [{ agentId: 1, onlineDurationSeconds: 3600 }],
            allValues: [{ dimension: '1', value: 3600, decile: 5 }],
        }
        const store = mockStore({
            ...defaultState,
            ui: {
                stats: {
                    ...defaultState.ui.stats,
                    statsTables: {
                        [AGENT_AVAILABILITY_SLICE_NAME]: {
                            sorting: {
                                field: column,
                                direction: OrderDirection.Asc,
                                isLoading: true,
                            },
                        },
                    },
                },
            },
        } as unknown as RootState)
        queryHook.mockReturnValue({
            isFetching: false,
            data: metricData,
            isError: false,
        })

        renderHook(
            () =>
                useAgentAvailabilitySortingQuery(
                    column,
                    queryHook,
                    statsFilters,
                ),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )

        expect(store.getActions()).toContainEqual(
            agentAvailability.actions.sortingLoaded(metricData.allData),
        )
    })

    it('should not dispatch query result on sorting isLoading and data is fetching', () => {
        const column = ONLINE_TIME_COLUMN
        const metricData: MetricWithDecile<number, Cubes>['data'] = {
            value: 123,
            decile: 5,
            allData: [{ agentId: 1, onlineDurationSeconds: 3600 }],
            allValues: [{ dimension: '1', value: 3600, decile: 5 }],
        }
        const store = mockStore({
            ...defaultState,
            ui: {
                ...defaultState.ui,
                statsAgents: {
                    [AGENT_AVAILABILITY_SLICE_NAME]: {
                        ...initialState,
                        sorting: {
                            field: column,
                            direction: OrderDirection.Asc,
                            isLoading: true,
                        },
                    },
                },
            },
        } as unknown as RootState)
        queryHook.mockReturnValue({
            isFetching: true,
            data: metricData,
            isError: false,
        })

        renderHook(
            () =>
                useAgentAvailabilitySortingQuery(
                    column,
                    queryHook,
                    statsFilters,
                ),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )

        expect(store.getActions()).not.toContainEqual(
            agentAvailability.actions.sortingLoaded(metricData.allData),
        )
    })

    it('should update loading state when the query of a current sorting column starts loading', () => {
        const column = ONLINE_TIME_COLUMN
        const store = mockStore({
            ...defaultState,
            ui: {
                stats: {
                    filters: uiStatsInitialState,
                    statsTables: {
                        [AGENT_AVAILABILITY_SLICE_NAME]: {
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
        } as unknown as RootState)
        queryHook.mockReturnValue({
            ...defaultState,
            isFetching: true,
        })

        renderHook(
            () =>
                useAgentAvailabilitySortingQuery(
                    column,
                    queryHook,
                    statsFilters,
                ),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )

        expect(store.getActions()).toContainEqual(
            agentAvailability.actions.sortingLoading(),
        )
    })
})
