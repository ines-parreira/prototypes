import { assumeMock, renderHook } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import moment from 'moment'

import { AiSalesAgentOrdersMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    fetchPostReportingV2,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchDiscountCodesAverageValueTrend,
    useDiscountCodesAverageValueTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useDiscountCodesAverageValueTrend'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
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

jest.mock('domains/reporting/utils/getNewStatsFeatureFlagMigration')
jest.mock('domains/reporting/utils/useGetNewStatsFeatureFlagMigration')
const getNewStatsFeatureFlagMigrationMock = assumeMock(
    getNewStatsFeatureFlagMigration,
)
const useGetNewStatsFeatureFlagMigrationMock = assumeMock(
    useGetNewStatsFeatureFlagMigration,
)

jest.useFakeTimers()

describe('DiscountCodesAverageValueTrend', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    beforeEach(() => {
        getNewStatsFeatureFlagMigrationMock.mockResolvedValue('off')
        useGetNewStatsFeatureFlagMigrationMock.mockReturnValue('off')
    })

    describe('useDiscountCodesAverageValueTrend', () => {
        it('should return correct metric data when the query resolves', async () => {
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
                () => useDiscountCodesAverageValueTrend(statsFilters, timezone),
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
                        value: 32,
                        prevValue: 24,
                    },
                    isError: false,
                    isFetching: false,
                })
            })
        })

        it('should return correct data if clickhouse returns null', async () => {
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: null,
            } as UseQueryResult)
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: 24,
            } as UseQueryResult)

            act(() => jest.runAllTimers())

            const { result } = renderHook(
                () => useDiscountCodesAverageValueTrend(statsFilters, timezone),
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
                        value: 0,
                        prevValue: 24,
                    },
                    isError: false,
                    isFetching: false,
                })
            })
        })
    })
    describe('fetchDiscountCodesAverageValueTrend', () => {
        it('should return the correct data when the query resolves', async () => {
            fetchPostReportingV2Mock.mockResolvedValueOnce({
                data: {
                    ...defaultReporting,
                    data: [
                        { [AiSalesAgentOrdersMeasure.AverageDiscountUsd]: 32 },
                    ],
                },
            } as unknown as ReturnType<typeof fetchPostReportingV2>)
            fetchPostReportingV2Mock.mockResolvedValueOnce({
                data: {
                    ...defaultReporting,
                    data: [
                        { [AiSalesAgentOrdersMeasure.AverageDiscountUsd]: 24 },
                    ],
                },
            } as unknown as ReturnType<typeof fetchPostReportingV2>)

            const result = await fetchDiscountCodesAverageValueTrend(
                statsFilters,
                timezone,
            )

            expect(result).toEqual({
                data: {
                    value: 32,
                    prevValue: 24,
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should return correct data if clickhouse returns null', async () => {
            fetchPostReportingV2Mock.mockResolvedValueOnce({
                data: {
                    ...defaultReporting,
                    data: [
                        { [AiSalesAgentOrdersMeasure.AverageDiscountUsd]: 32 },
                    ],
                },
            } as unknown as ReturnType<typeof fetchPostReportingV2>)
            fetchPostReportingV2Mock.mockResolvedValueOnce({
                data: {
                    ...defaultReporting,
                    data: [
                        {
                            [AiSalesAgentOrdersMeasure.AverageDiscountUsd]:
                                null,
                        },
                    ],
                },
            } as unknown as ReturnType<typeof fetchPostReportingV2>)

            const result = await fetchDiscountCodesAverageValueTrend(
                statsFilters,
                timezone,
            )

            expect(result).toEqual({
                data: {
                    value: 32,
                    prevValue: 0,
                },
                isError: false,
                isFetching: false,
            })
        })
    })
})
