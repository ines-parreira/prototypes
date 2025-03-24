import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks/dom'
import moment from 'moment'

import {
    fetchTicketHandleTimeTrend,
    useTicketHandleTimeTrend,
} from 'hooks/reporting/metricTrends'
import { StatsFilters } from 'models/stat/types'
import {
    fetchSuccessRateTrend,
    useSuccessRateTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useSuccessRateTrend'
import {
    fetchTotalSalesOpportunityAIConvTrend,
    useTotalSalesOpportunityAIConvTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useTotalSalesOpportunityAIConvTrend'
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
    'pages/stats/automate/aiSalesAgent/metrics/useTotalSalesOpportunityAIConvTrend',
)
const useTotalSalesOpportunityAIConvTrendMock = assumeMock(
    useTotalSalesOpportunityAIConvTrend,
)
const fetchTotalSalesOpportunityAIConvTrendMock = assumeMock(
    fetchTotalSalesOpportunityAIConvTrend,
)

jest.mock('pages/stats/automate/aiSalesAgent/metrics/useSuccessRateTrend')
const useSuccessRateTrendMock = assumeMock(useSuccessRateTrend)
const fetchSuccessRateTrendMock = assumeMock(fetchSuccessRateTrend)

jest.mock('hooks/reporting/metricTrends')
const useTicketHandleTimeTrendMock = assumeMock(useTicketHandleTimeTrend)
const fetchTicketHandleTimeTrendMock = assumeMock(fetchTicketHandleTimeTrend)

describe('timeSavedByAgentTrend', () => {
    describe('useTimeSavedByAgentTrend', () => {
        beforeEach(() => {
            useSuccessRateTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 10,
                    prevValue: 2,
                },
            })
            useTotalSalesOpportunityAIConvTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 10,
                    prevValue: 2,
                },
            })
            useTicketHandleTimeTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 2,
                    prevValue: 1,
                },
            })
        })

        it('should return correct metric data when the query resolves', async () => {
            act(() => jest.runAllTimers())

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
                        prevValue: 4,
                        value: 200,
                    },
                    isError: false,
                    isFetching: false,
                })
            })
        })

        it('should retrun correct value if cube returns null', async () => {
            act(() => jest.runAllTimers())

            useSuccessRateTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: null,
                    prevValue: null,
                },
            } as unknown as ReturnType<typeof useSuccessRateTrend>)

            useTotalSalesOpportunityAIConvTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: null,
                    prevValue: null,
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
        beforeEach(() => {
            fetchSuccessRateTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 10,
                    prevValue: 2,
                },
            } as unknown as ReturnType<typeof fetchSuccessRateTrend>)
            fetchTotalSalesOpportunityAIConvTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 10,
                    prevValue: 2,
                },
            } as unknown as ReturnType<
                typeof fetchTotalSalesOpportunityAIConvTrend
            >)
            fetchTicketHandleTimeTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 2,
                    prevValue: 1,
                },
            } as unknown as ReturnType<typeof fetchTicketHandleTimeTrend>)
        })

        it('should return correct metric data when the query resolves', async () => {
            act(() => jest.runAllTimers())

            const result = await fetchTimeSavedByAgentTrend(filters, timezone)

            expect(result).toEqual({
                data: {
                    prevValue: 4,
                    value: 200,
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should retrun correct value if cube returns null', async () => {
            act(() => jest.runAllTimers())

            fetchSuccessRateTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: { value: null, prevValue: null },
            } as unknown as ReturnType<typeof fetchSuccessRateTrend>)

            fetchTotalSalesOpportunityAIConvTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    prevValue: 0,
                    value: 0,
                },
            } as unknown as ReturnType<
                typeof fetchTotalSalesOpportunityAIConvTrend
            >)
            fetchTicketHandleTimeTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: null,
                    prevValue: null,
                },
            } as unknown as ReturnType<typeof fetchTicketHandleTimeTrend>)

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
