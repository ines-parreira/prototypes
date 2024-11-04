import {renderHook} from '@testing-library/react-hooks'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    useOnlineTimeMetric,
    useTicketsRepliedMetric,
} from 'hooks/reporting/metrics'
import {useTicketsRepliedPerHour} from 'hooks/reporting/useTicketsRepliedPerHour'

import {fromLegacyStatsFilters} from 'state/stats/utils'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiStatsInitialState} from 'state/ui/stats/filtersSlice'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/metrics')
const useTicketsRepliedMetricMock = assumeMock(useTicketsRepliedMetric)
const useOnlineTimeMock = assumeMock(useOnlineTimeMetric)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('useTicketsRepliedPerHour.ts', () => {
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
        stats: {filters: fromLegacyStatsFilters(statsFilters)},
        ui: {
            stats: {
                filters: uiStatsInitialState,
            },
        },
    } as RootState

    const timeZone = 'UTC'
    const ticketsClosed = 50
    const onlineTimeValue = 60 * 60 * 4
    const useTicketsRepliedMetricReturnValue = {
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

    beforeEach(() => {
        useTicketsRepliedMetricMock.mockReturnValue(
            useTicketsRepliedMetricReturnValue
        )
        useOnlineTimeMock.mockReturnValue(useOnlineTimeReturnValue)
    })

    it('should calculate the metric from messages sent and online time', () => {
        const {result} = renderHook(
            () => useTicketsRepliedPerHour(statsFilters, timeZone),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            }
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
        renderHook(() => useTicketsRepliedPerHour(statsFilters, timeZone), {
            wrapper: ({children}) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(useTicketsRepliedMetricMock).toHaveBeenCalledWith(
            {
                period: statsFilters.period,
                agents: statsFilters.agents,
            },
            timeZone
        )
        expect(useOnlineTimeMock).toHaveBeenCalledWith(
            {
                period: statsFilters.period,
                agents: statsFilters.agents,
            },
            timeZone
        )
    })

    it('should strip the statsFilters to period and no agents', () => {
        const statsFiltersWithoutAgents = {
            period: statsFilters.period,
        }
        const state = {
            stats: {filters: statsFiltersWithoutAgents},
            ui: {
                stats: {
                    filters: uiStatsInitialState,
                },
            },
        } as RootState

        renderHook(
            () => useTicketsRepliedPerHour(statsFiltersWithoutAgents, timeZone),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore(state)}>{children}</Provider>
                ),
            }
        )

        expect(useTicketsRepliedMetricMock).toHaveBeenCalledWith(
            {
                period: statsFilters.period,
            },
            timeZone
        )
        expect(useOnlineTimeMock).toHaveBeenCalledWith(
            {
                period: statsFilters.period,
            },
            timeZone
        )
    })

    it('should return empty data when no data', () => {
        useTicketsRepliedMetricMock.mockReturnValue({
            ...useTicketsRepliedMetricReturnValue,
            data: undefined,
        })
        useOnlineTimeMock.mockReturnValue({
            ...useOnlineTimeReturnValue,
            data: undefined,
        })

        const {result} = renderHook(
            () => useTicketsRepliedPerHour(statsFilters, timeZone),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            }
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
