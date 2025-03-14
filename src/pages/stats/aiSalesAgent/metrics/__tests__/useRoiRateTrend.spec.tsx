import React from 'react'

import { QueryClientProvider, UseQueryResult } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks/dom'
import moment from 'moment'

import { AiSalesAgentOrdersMeasure } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { fetchPostReporting, usePostReporting } from 'models/reporting/queries'
import { StatsFilters } from 'models/stat/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import { fetchRoiRateTrend, useRoiRateTrend } from '../useRoiRateTrend'
import {
    fetchTotalSalesOpportunityAIConvTrend,
    useTotalSalesOpportunityAIConvTrend,
} from '../useTotalSalesOpportunityAIConvTrend'

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
    'pages/stats/aiSalesAgent/metrics/useTotalSalesOpportunityAIConvTrend',
)
const useTotalAIConvTrendMock = assumeMock(useTotalSalesOpportunityAIConvTrend)
const fetchTotalAIConvTrendMock = assumeMock(
    fetchTotalSalesOpportunityAIConvTrend,
)

jest.mock('models/reporting/queries')
const usePostReportingMock = assumeMock(usePostReporting)
const fetchPostReportingMock = assumeMock(fetchPostReporting)

describe('roiRateTrend', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    describe('useRoiRateTrend', () => {
        it('should return correct metric data when the query resolves', async () => {
            act(() => jest.runAllTimers())

            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: 32,
            } as UseQueryResult)
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: 24,
            } as UseQueryResult)

            useTotalAIConvTrendMock.mockReturnValue({
                ...defaultReporting,
                data: {
                    value: 2,
                    prevValue: 6,
                },
            })

            const { result } = renderHook(
                () => useRoiRateTrend(filters, timezone),
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
                        prevValue: 5.4,
                        value: 21.6,
                    },
                    isError: false,
                    isFetching: false,
                })
            })
        })

        it('should retrun correct value if cube returns null', async () => {
            act(() => jest.runAllTimers())

            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: null,
            } as UseQueryResult)
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: null,
            } as UseQueryResult)
            useTotalAIConvTrendMock.mockReturnValue({
                ...defaultReporting,
                data: {
                    value: null,
                    prevValue: null,
                },
            })

            const { result } = renderHook(
                () => useRoiRateTrend(filters, timezone),
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

    describe('fetchRoiRateTrend', () => {
        it('should return correct metric data when the query resolves', async () => {
            act(() => jest.runAllTimers())

            fetchPostReportingMock.mockReturnValueOnce({
                data: {
                    ...defaultReporting,
                    data: [{ [AiSalesAgentOrdersMeasure.GmvUsd]: 32 }],
                },
            } as unknown as ReturnType<typeof fetchPostReporting>)
            fetchPostReportingMock.mockReturnValueOnce({
                data: {
                    ...defaultReporting,
                    data: [{ [AiSalesAgentOrdersMeasure.GmvUsd]: 24 }],
                },
            } as unknown as ReturnType<typeof fetchPostReporting>)

            fetchTotalAIConvTrendMock.mockReturnValue({
                ...defaultReporting,
                data: {
                    value: 2,
                    prevValue: 6,
                },
            } as unknown as ReturnType<typeof fetchTotalAIConvTrendMock>)

            const result = await fetchRoiRateTrend(filters, timezone)

            expect(result).toEqual({
                data: {
                    prevValue: 5.4,
                    value: 21.6,
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should retrun correct value if cube returns null', async () => {
            act(() => jest.runAllTimers())

            fetchPostReportingMock.mockReturnValueOnce({
                data: {
                    ...defaultReporting,
                    data: [],
                },
            } as unknown as ReturnType<typeof fetchPostReporting>)
            fetchPostReportingMock.mockReturnValueOnce({
                data: {
                    ...defaultReporting,
                    data: [],
                },
            } as unknown as ReturnType<typeof fetchPostReporting>)

            fetchTotalAIConvTrendMock.mockReturnValue({
                ...defaultReporting,
                data: {
                    value: null,
                    prevValue: null,
                },
            } as unknown as ReturnType<typeof fetchTotalAIConvTrendMock>)

            const result = await fetchRoiRateTrend(filters, timezone)

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
