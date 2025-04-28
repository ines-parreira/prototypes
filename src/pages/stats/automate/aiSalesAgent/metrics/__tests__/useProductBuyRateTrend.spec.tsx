import React from 'react'

import { QueryClientProvider, UseQueryResult } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { act } from '@testing-library/react-hooks/dom'
import moment from 'moment'

import { AiSalesAgentOrdersMeasure } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { fetchPostReporting, usePostReporting } from 'models/reporting/queries'
import { StatsFilters } from 'models/stat/types'
import {
    fetchTotalProductRecommendations,
    useTotalProductRecommendations,
} from 'pages/stats/automate/aiSalesAgent/metrics/useTotalProductRecommendations'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import {
    fetchProductBuyRateTrend,
    useProductBuyRateTrend,
} from '../useProductBuyRateTrend'

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

jest.mock('models/reporting/queries')
const usePostReportingMock = assumeMock(usePostReporting)
const fetchPostReportingMock = assumeMock(fetchPostReporting)

jest.mock(
    'pages/stats/automate/aiSalesAgent/metrics/useTotalProductRecommendations',
)
const useTotalProductRecommendationsMock = assumeMock(
    useTotalProductRecommendations,
)
const fetchTotalProductRecommendationsMock = assumeMock(
    fetchTotalProductRecommendations,
)

jest.useFakeTimers()

describe('productBuyRateTrend', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    describe('useProductBuyRateTrend', () => {
        it('should return correct metric data when the query resolves', async () => {
            useTotalProductRecommendationsMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 2,
                    prevValue: 3,
                },
            })
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: 3,
            } as UseQueryResult)
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: 6,
            } as UseQueryResult)

            act(() => jest.runAllTimers())

            const { result } = renderHook(
                () => useProductBuyRateTrend(statsFilters, timezone),
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
                        value: 150,
                        prevValue: 200,
                    },
                    isError: false,
                    isFetching: false,
                })
            })
        })
    })

    describe('fetchProductBuyRateTrend', () => {
        it('should return the correct data when the query resolves', async () => {
            fetchTotalProductRecommendationsMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 2,
                    prevValue: 3,
                },
            } as unknown as ReturnType<typeof fetchTotalProductRecommendations>)
            fetchPostReportingMock.mockReturnValueOnce({
                data: {
                    ...defaultReporting,
                    data: [{ [AiSalesAgentOrdersMeasure.Count]: 3 }],
                },
            } as unknown as ReturnType<typeof fetchPostReporting>)
            fetchPostReportingMock.mockReturnValueOnce({
                data: {
                    ...defaultReporting,
                    data: [{ [AiSalesAgentOrdersMeasure.Count]: 6 }],
                },
            } as unknown as ReturnType<typeof fetchPostReporting>)

            const result = await fetchProductBuyRateTrend(
                statsFilters,
                timezone,
            )

            expect(result).toEqual({
                data: {
                    value: 150,
                    prevValue: 200,
                },
                isError: false,
                isFetching: false,
            })
        })
    })
})
