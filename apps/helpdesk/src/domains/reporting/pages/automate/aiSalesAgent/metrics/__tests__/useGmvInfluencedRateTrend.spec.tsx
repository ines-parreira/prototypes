import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider, UseQueryResult } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import moment from 'moment'

import { AiSalesAgentOrdersMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    fetchPostReportingV2,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchGmvInfluencedRateTrend,
    useGmvInfluencedRateTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedRateTrend'
import {
    fetchGmvInfluencedTrendInUSD,
    useGmvInfluencedTrendInUSD,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

const timezone = 'UTC'

const statsFilters: StatsFilters = {
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

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend',
)
const useGmvInfluencedTrendInUSDMock = assumeMock(useGmvInfluencedTrendInUSD)
const fetchGmvInfluencedTrendInUSDMock = assumeMock(
    fetchGmvInfluencedTrendInUSD,
)

jest.mock('domains/reporting/models/queries')
const usePostReportingMock = assumeMock(usePostReportingV2)
const fetchPostReportingV2Mock = assumeMock(fetchPostReportingV2)

jest.useFakeTimers()

describe('gmvInfluencedRateTrend', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    describe('useGmvInfluecedTrend', () => {
        it('should return correct metric data when the query resolves', async () => {
            useGmvInfluencedTrendInUSDMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 10,
                    prevValue: 2,
                },
            })
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: 32,
            } as UseQueryResult)
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: 24,
            } as UseQueryResult)

            act(() => jest.runAllTimers())

            const { result } = renderHook(
                () => useGmvInfluencedRateTrend(statsFilters, timezone),
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
                        prevValue: 0.08333333333333333,
                        value: 0.3125,
                    },
                    isError: false,
                    isFetching: false,
                })
            })
        })
    })

    describe('fetchGmvInfluncedTrend', () => {
        it('should return the correct data when the query resolves', async () => {
            fetchGmvInfluencedTrendInUSDMock.mockReturnValue({
                ...defaultReporting,
                data: {
                    value: 10,
                    prevValue: 2,
                },
            } as unknown as ReturnType<typeof fetchGmvInfluencedTrendInUSD>)
            fetchPostReportingV2Mock.mockResolvedValueOnce({
                data: {
                    ...defaultReporting,
                    data: [{ [AiSalesAgentOrdersMeasure.GmvUsd]: 32 }],
                },
            } as unknown as ReturnType<typeof fetchPostReportingV2>)
            fetchPostReportingV2Mock.mockResolvedValueOnce({
                data: {
                    ...defaultReporting,
                    data: [{ [AiSalesAgentOrdersMeasure.GmvUsd]: 24 }],
                },
            } as unknown as ReturnType<typeof fetchPostReportingV2>)

            const result = await fetchGmvInfluencedRateTrend(
                statsFilters,
                timezone,
            )

            expect(result).toEqual({
                data: {
                    prevValue: 0.08333333333333333,
                    value: 0.3125,
                },
                isError: false,
                isFetching: false,
            })
        })
    })
})
