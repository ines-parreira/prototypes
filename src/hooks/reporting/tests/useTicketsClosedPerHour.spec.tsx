import React from 'react'

import { renderHook } from '@testing-library/react-hooks'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    fetchClosedTicketsMetric,
    fetchOnlineTimeMetric,
    useClosedTicketsMetric,
    useOnlineTimeMetric,
} from 'hooks/reporting/metrics'
import {
    fetchTicketsClosedPerHour,
    useTicketsClosedPerHour,
} from 'hooks/reporting/useTicketsClosedPerHour'
import { fromLegacyStatsFilters } from 'state/stats/utils'
import { RootState, StoreDispatch } from 'state/types'
import { initialState as uiStatsInitialState } from 'state/ui/stats/filtersSlice'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/metrics')
const useClosedTicketsMetricMock = assumeMock(useClosedTicketsMetric)
const useOnlineTimeMock = assumeMock(useOnlineTimeMetric)
const fetchClosedTicketsMetricMock = assumeMock(fetchClosedTicketsMetric)
const fetchOnlineTimeMetricMock = assumeMock(fetchOnlineTimeMetric)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('TicketsClosedPerHour', () => {
    const statsFilters = {
        period: {
            start_datetime: '2021-05-29T00:00:00+02:00',
            end_datetime: '2021-06-04T23:59:59+02:00',
        },
        integrations: [456],
        agents: [1, 2],
        tags: [123],
    }
    const defaultState = {
        stats: { filters: fromLegacyStatsFilters(statsFilters) },
        ui: {
            stats: {
                filters: uiStatsInitialState,
            },
        },
    } as RootState

    const timeZone = 'UTC'
    const ticketsClosed = 50
    const onlineTimeValue = 60 * 60 * 4
    const useClosedTicketsMetricReturnValue = {
        data: {
            value: ticketsClosed,
        },
        isFetching: false,
        isError: false,
    }
    const useOnlineTimeReturnValue = {
        data: {
            value: onlineTimeValue,
        },
        isFetching: false,
        isError: false,
    }

    describe('useTicketsClosedPerHour.ts', () => {
        beforeEach(() => {
            useClosedTicketsMetricMock.mockReturnValue(
                useClosedTicketsMetricReturnValue,
            )
            useOnlineTimeMock.mockReturnValue(useOnlineTimeReturnValue)
        })

        it('should calculate the metric from messages sent and online time', () => {
            const { result } = renderHook(
                () => useTicketsClosedPerHour(statsFilters, timeZone),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(defaultState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current).toEqual({
                data: {
                    value: 12.5,
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should strip the statsFilters to period and agents only', () => {
            renderHook(() => useTicketsClosedPerHour(statsFilters, timeZone), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            })

            expect(useClosedTicketsMetricMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                    agents: statsFilters.agents,
                },
                timeZone,
            )
            expect(useOnlineTimeMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                    agents: statsFilters.agents,
                },
                timeZone,
            )
        })

        it('should strip the statsFilters to period and no agents', () => {
            const statsFiltersWithoutAgents = {
                period: statsFilters.period,
            }
            const state = {
                stats: { filters: statsFiltersWithoutAgents },
                ui: {
                    stats: {
                        filters: uiStatsInitialState,
                    },
                },
            } as RootState

            renderHook(
                () =>
                    useTicketsClosedPerHour(
                        statsFiltersWithoutAgents,
                        timeZone,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(state)}>{children}</Provider>
                    ),
                },
            )

            expect(useClosedTicketsMetricMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                },
                timeZone,
            )
            expect(useOnlineTimeMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                },
                timeZone,
            )
        })

        it('should return empty data when no data', () => {
            useClosedTicketsMetricMock.mockReturnValue({
                ...useClosedTicketsMetricReturnValue,
                data: undefined,
            })
            useOnlineTimeMock.mockReturnValue({
                ...useOnlineTimeReturnValue,
                data: undefined,
            })

            const { result } = renderHook(
                () => useTicketsClosedPerHour(statsFilters, timeZone),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(defaultState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current).toEqual({
                data: {
                    value: null,
                },
                isError: false,
                isFetching: false,
            })
        })
    })

    describe('fetchTicketsClosedPerHour.ts', () => {
        beforeEach(() => {
            fetchClosedTicketsMetricMock.mockResolvedValue(
                useClosedTicketsMetricReturnValue,
            )
            fetchOnlineTimeMetricMock.mockResolvedValue(
                useOnlineTimeReturnValue,
            )
        })

        it('should calculate the metric from messages sent and online time', async () => {
            const result = await fetchTicketsClosedPerHour(
                statsFilters,
                timeZone,
            )

            expect(result).toEqual({
                data: {
                    value: 12.5,
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should strip the statsFilters to period and agents only', async () => {
            await fetchTicketsClosedPerHour(statsFilters, timeZone)

            expect(fetchClosedTicketsMetricMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                    agents: statsFilters.agents,
                },
                timeZone,
            )
            expect(fetchOnlineTimeMetricMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                    agents: statsFilters.agents,
                },
                timeZone,
            )
        })

        it('should strip the statsFilters to period and no agents', async () => {
            const statsFiltersWithoutAgents = {
                period: statsFilters.period,
            }

            await fetchTicketsClosedPerHour(statsFiltersWithoutAgents, timeZone)

            expect(fetchClosedTicketsMetricMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                },
                timeZone,
            )
            expect(fetchOnlineTimeMetricMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                },
                timeZone,
            )
        })

        it('should return empty data when no data', async () => {
            fetchClosedTicketsMetricMock.mockResolvedValue({
                ...useClosedTicketsMetricReturnValue,
                data: undefined,
            })
            fetchOnlineTimeMetricMock.mockResolvedValue({
                ...useOnlineTimeReturnValue,
                data: undefined,
            })

            const result = await fetchTicketsClosedPerHour(
                statsFilters,
                timeZone,
            )

            expect(result).toEqual({
                data: {
                    value: null,
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should return empty data on error', async () => {
            fetchClosedTicketsMetricMock.mockRejectedValue({
                ...useClosedTicketsMetricReturnValue,
                data: undefined,
            })
            fetchOnlineTimeMetricMock.mockResolvedValue({
                ...useOnlineTimeReturnValue,
                data: undefined,
            })

            const result = await fetchTicketsClosedPerHour(
                statsFilters,
                timeZone,
            )

            expect(result).toEqual({
                data: {
                    value: null,
                },
                isError: true,
                isFetching: false,
            })
        })
    })
})
