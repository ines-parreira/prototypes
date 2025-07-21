import { QueryClientProvider, UseQueryResult } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import moment from 'moment'

import { AiSalesAgentConversationsMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import {
    fetchPostReporting,
    usePostReporting,
} from 'domains/reporting/models/queries'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchTotalProductRecommendations,
    useTotalProductRecommendations,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalProductRecommendations'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

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
const usePostReportingMock = assumeMock(usePostReporting)
const fetchPostReportingMock = assumeMock(fetchPostReporting)

jest.useFakeTimers()

describe('totalProductRecommendations', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    describe('useTotalProductRecommendations', () => {
        it('should return correct metric data when the query resolves', async () => {
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: 101.2,
            } as UseQueryResult)
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: 50.4,
            } as UseQueryResult)

            act(() => jest.runAllTimers())

            const { result } = renderHook(
                () => useTotalProductRecommendations(statsFilters, timezone),
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
                        value: 101.2,
                        prevValue: 50.4,
                    },
                    isError: false,
                    isFetching: false,
                })
            })
        })
    })

    describe('fetchTotalProductRecommendations', () => {
        it('should return the correct data when the query resolves', async () => {
            fetchPostReportingMock.mockReturnValueOnce({
                data: {
                    ...defaultReporting,
                    data: [{ [AiSalesAgentConversationsMeasure.Count]: 101.2 }],
                },
            } as unknown as ReturnType<typeof fetchPostReporting>)
            fetchPostReportingMock.mockReturnValueOnce({
                data: {
                    ...defaultReporting,
                    data: [{ [AiSalesAgentConversationsMeasure.Count]: 50.4 }],
                },
            } as unknown as ReturnType<typeof fetchPostReporting>)

            const result = await fetchTotalProductRecommendations(
                statsFilters,
                timezone,
            )

            expect(result).toEqual({
                data: {
                    value: 101.2,
                    prevValue: 50.4,
                },
                isError: false,
                isFetching: false,
            })
        })
    })
})
