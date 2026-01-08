import { assumeMock, renderHook } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import moment from 'moment'

import { AiSalesAgentConversationsMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import {
    fetchPostReportingV2,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchTotalNumberOfSalesConversationsTrend,
    useTotalNumberOfSalesConversationsTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfSalesConversationsTrend'
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

describe('totalAIConvTrend', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    beforeEach(() => {
        getNewStatsFeatureFlagMigrationMock.mockResolvedValue('off')
        useGetNewStatsFeatureFlagMigrationMock.mockReturnValue('off')
    })

    describe('useTotalAIConvTrend', () => {
        it('should return correct metric data when the query resolves', async () => {
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: 32.41,
            } as UseQueryResult)
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: 24.56,
            } as UseQueryResult)

            act(() => jest.runAllTimers())

            const { result } = renderHook(
                () =>
                    useTotalNumberOfSalesConversationsTrend(
                        statsFilters,
                        timezone,
                    ),
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
                    },
                    isError: false,
                    isFetching: false,
                })
            })
        })
    })

    describe('fetchTotalAIConvTrend', () => {
        it('should return the correct data when the query resolves', async () => {
            fetchPostReportingV2Mock.mockResolvedValueOnce({
                data: {
                    ...defaultReporting,
                    data: [{ [AiSalesAgentConversationsMeasure.Count]: 32.41 }],
                },
            } as unknown as ReturnType<typeof fetchPostReportingV2>)
            fetchPostReportingV2Mock.mockResolvedValueOnce({
                data: {
                    ...defaultReporting,
                    data: [{ [AiSalesAgentConversationsMeasure.Count]: 24.56 }],
                },
            } as unknown as ReturnType<typeof fetchPostReportingV2>)

            const result = await fetchTotalNumberOfSalesConversationsTrend(
                statsFilters,
                timezone,
            )

            expect(result).toEqual({
                data: {
                    value: 32.41,
                    prevValue: 24.56,
                },
                isError: false,
                isFetching: false,
            })
        })
    })
})
