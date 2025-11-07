import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider, UseQueryResult } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import moment from 'moment'

import { ConvertTrackingEventsMeasure } from 'domains/reporting/models/cubes/convert/ConvertTrackingEventsCube'
import {
    fetchPostReportingV2,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchProductClickRateTrend,
    useProductClickRateTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useProductClickRateTrend'
import {
    fetchTotalProductRecommendations,
    useTotalProductRecommendations,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalProductRecommendations'
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

jest.mock('domains/reporting/models/queries')
const usePostReportingMock = assumeMock(usePostReportingV2)
const fetchPostReportingV2Mock = assumeMock(fetchPostReportingV2)

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalProductRecommendations',
)
const useTotalProductRecommendationsMock = assumeMock(
    useTotalProductRecommendations,
)
const fetchTotalProductRecommendationsMock = assumeMock(
    fetchTotalProductRecommendations,
)

jest.useFakeTimers()

describe('productClickRateTrend', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    describe('useProductClickRateTrend', () => {
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
                () => useProductClickRateTrend(statsFilters, timezone),
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

    describe('fetchProductClickRateTrend', () => {
        it('should return the correct data when the query resolves', async () => {
            fetchTotalProductRecommendationsMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 2,
                    prevValue: 3,
                },
            } as unknown as ReturnType<typeof fetchTotalProductRecommendations>)
            fetchPostReportingV2Mock.mockResolvedValueOnce({
                data: {
                    ...defaultReporting,
                    data: [{ [ConvertTrackingEventsMeasure.UniqClicks]: 3 }],
                },
            } as unknown as ReturnType<typeof fetchPostReportingV2>)
            fetchPostReportingV2Mock.mockResolvedValueOnce({
                data: {
                    ...defaultReporting,
                    data: [{ [ConvertTrackingEventsMeasure.UniqClicks]: 6 }],
                },
            } as unknown as ReturnType<typeof fetchPostReportingV2>)

            const result = await fetchProductClickRateTrend(
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
