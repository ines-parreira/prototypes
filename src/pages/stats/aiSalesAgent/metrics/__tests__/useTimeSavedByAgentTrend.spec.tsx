import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks/dom'
import moment from 'moment'

import {
    fetchOnlineTimeTrend,
    useOnlineTimeTrend,
} from 'hooks/reporting/metricTrends'
import { StatsFilters } from 'models/stat/types'
import {
    fetchTotalNumberOfAgentConverationsTrend,
    useTotalNumberOfAgentConverationsTrend,
} from 'pages/stats/aiSalesAgent/metrics/useTotalNumberOfAgentConverationsTrend'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import {
    fetchTimeSavedByAgentTrend,
    useTimeSavedByAgentTrend,
} from '../useTimeSavedByAgentTrend'

const timezone = 'UTC'

const filters: StatsFilters = {
    period: {
        start_datetime: moment()
            .add(1 * 7, 'day')
            .format('YYYY-MM-DDT00:00:00.000'),
        end_datetime: moment()
            .add(3 * 7, 'day')
            .format('YYYY-MM-DDT23:50:59.999'),
    },
}

const queryClient = mockQueryClient()

jest.useFakeTimers()

jest.mock(
    'pages/stats/aiSalesAgent/metrics/useTotalNumberOfAgentConverationsTrend',
)
const useTotalNumberOfAgentConverationsTrendMock = assumeMock(
    useTotalNumberOfAgentConverationsTrend,
)
const fetchTotalNumberOfAgentConverationsTrendMock = assumeMock(
    fetchTotalNumberOfAgentConverationsTrend,
)

jest.mock('hooks/reporting/metricTrends')
const useOnlineTimeTrendMock = assumeMock(useOnlineTimeTrend)
const fetchOnlineTimeTrendMock = assumeMock(fetchOnlineTimeTrend)

describe('timeSavedByAgentTrend', () => {
    describe('useTimeSavedByAgentTrend', () => {
        it('should return correct metric data when the query resolves', async () => {
            act(() => jest.runAllTimers())

            useTotalNumberOfAgentConverationsTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 10,
                    prevValue: 2,
                },
            })
            useOnlineTimeTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 2,
                    prevValue: 1,
                },
            })

            const { result } = renderHook(
                () => useTimeSavedByAgentTrend(filters, timezone),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    ),
                },
            )

            await waitFor(() => {
                expect(result.current).toEqual({
                    data: {
                        prevValue: 2,
                        value: 20,
                    },
                    isError: false,
                    isFetching: false,
                })
            })
        })

        it('should retrun correct value if cube returns null', async () => {
            act(() => jest.runAllTimers())

            useTotalNumberOfAgentConverationsTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: null,
                    prevValue: null,
                },
            })
            useOnlineTimeTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 2,
                    prevValue: 1,
                },
            })

            const { result } = renderHook(
                () => useTimeSavedByAgentTrend(filters, timezone),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    ),
                },
            )

            await waitFor(() => {
                expect(result.current).toEqual({
                    data: {
                        prevValue: 0,
                        value: 0,
                    },
                    isError: false,
                    isFetching: false,
                })
            })
        })
    })

    describe('fetchimeSavedByAgentTrend', () => {
        it('should return correct metric data when the query resolves', async () => {
            act(() => jest.runAllTimers())

            fetchTotalNumberOfAgentConverationsTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 10,
                    prevValue: 2,
                },
            } as unknown as ReturnType<
                typeof fetchTotalNumberOfAgentConverationsTrend
            >)
            fetchOnlineTimeTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 2,
                    prevValue: 1,
                },
            } as unknown as ReturnType<typeof fetchOnlineTimeTrend>)

            const result = await fetchTimeSavedByAgentTrend(filters, timezone)

            expect(result).toEqual({
                data: {
                    prevValue: 2,
                    value: 20,
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should retrun correct value if cube returns null', async () => {
            act(() => jest.runAllTimers())

            fetchTotalNumberOfAgentConverationsTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    prevValue: 0,
                    value: 0,
                },
            } as unknown as ReturnType<
                typeof fetchTotalNumberOfAgentConverationsTrend
            >)
            fetchOnlineTimeTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: null,
                    prevValue: null,
                },
            } as unknown as ReturnType<typeof fetchOnlineTimeTrend>)

            const result = await fetchTimeSavedByAgentTrend(filters, timezone)

            expect(result).toEqual({
                data: {
                    prevValue: 0,
                    value: 0,
                },
                isError: false,
                isFetching: false,
            })
        })
    })
})
