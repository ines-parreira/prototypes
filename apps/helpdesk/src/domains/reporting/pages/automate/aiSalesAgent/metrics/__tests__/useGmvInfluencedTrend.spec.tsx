import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import moment from 'moment'

import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchGmvInfluencedTrend,
    useGmvInfluencedTrend,
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

jest.mock('domains/reporting/hooks/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimensionV2)
const fetchMetricPerDimensionMock = assumeMock(fetchMetricPerDimensionV2)

jest.useFakeTimers()

describe('gmvInfluencedTrend', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    }

    describe('useGmvInfluencedTrend', () => {
        it('should return correct metric data with currency when the query resolves', async () => {
            useMetricPerDimensionMock.mockReturnValueOnce({
                ...defaultReporting,
                data: {
                    value: null,
                    decile: null,
                    allData: [
                        {
                            [AiSalesAgentOrdersMeasure.Gmv]: '32.41',
                            [AiSalesAgentOrdersDimension.Currency]: 'USD',
                        },
                    ],
                },
            })
            useMetricPerDimensionMock.mockReturnValueOnce({
                ...defaultReporting,
                data: {
                    value: null,
                    decile: null,
                    allData: [
                        {
                            [AiSalesAgentOrdersMeasure.Gmv]: '24.56',
                            [AiSalesAgentOrdersDimension.Currency]: 'USD',
                        },
                    ],
                },
            })

            act(() => jest.runAllTimers())

            const { result } = renderHook(
                () => useGmvInfluencedTrend(statsFilters, timezone),
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
                        value: 32.41,
                        prevValue: 24.56,
                        currency: 'USD',
                    },
                    isError: false,
                    isFetching: false,
                })
            })
        })

        it('should handle null values correctly', async () => {
            useMetricPerDimensionMock.mockReturnValueOnce({
                ...defaultReporting,
                data: null,
            })
            useMetricPerDimensionMock.mockReturnValueOnce({
                ...defaultReporting,
                data: null,
            })

            const { result } = renderHook(
                () => useGmvInfluencedTrend(statsFilters, timezone),
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
                        value: null,
                        prevValue: null,
                        currency: 'USD',
                    },
                    isError: false,
                    isFetching: false,
                })
            })
        })
    })

    describe('fetchGmvInfluencedTrend', () => {
        it('should return the correct data with currency when the query resolves', async () => {
            fetchMetricPerDimensionMock.mockReturnValueOnce(
                Promise.resolve({
                    ...defaultReporting,
                    data: {
                        value: null,
                        decile: null,
                        allData: [
                            {
                                [AiSalesAgentOrdersMeasure.Gmv]: '32.41',
                                [AiSalesAgentOrdersDimension.Currency]: 'EUR',
                            },
                        ],
                    },
                }),
            )
            fetchMetricPerDimensionMock.mockReturnValueOnce(
                Promise.resolve({
                    ...defaultReporting,
                    data: {
                        value: null,
                        decile: null,
                        allData: [
                            {
                                [AiSalesAgentOrdersMeasure.Gmv]: '24.56',
                                [AiSalesAgentOrdersDimension.Currency]: 'EUR',
                            },
                        ],
                    },
                }),
            )

            const result = await fetchGmvInfluencedTrend(statsFilters, timezone)

            expect(result).toEqual({
                data: {
                    value: 32.41,
                    prevValue: 24.56,
                    currency: 'EUR',
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should handle errors correctly', async () => {
            fetchMetricPerDimensionMock.mockRejectedValueOnce(
                new Error('Network error'),
            )

            const result = await fetchGmvInfluencedTrend(statsFilters, timezone)

            expect(result).toEqual({
                data: {
                    value: null,
                    prevValue: null,
                    currency: 'USD',
                },
                isError: true,
                isFetching: false,
            })
        })
    })
})
