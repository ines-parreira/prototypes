import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider, UseQueryResult } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import moment from 'moment'

import { AiSalesAgentOrdersMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    fetchPostReporting,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchDiscountCodesAppliedTrend,
    useDiscountCodesAppliedTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useDiscountCodesAppliedTrend'
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
const fetchPostReportingMock = assumeMock(fetchPostReporting)

jest.useFakeTimers()

describe('DiscountCodesAppliedTrend', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    describe('useDiscountCodesAppliedTrend', () => {
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
                () => useDiscountCodesAppliedTrend(statsFilters, timezone),
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
    })
    describe('fetchDiscountCodesAppliedTrend', () => {
        it('should return the correct data when the query resolves', async () => {
            fetchPostReportingMock.mockResolvedValueOnce({
                data: {
                    ...defaultReporting,
                    data: [{ [AiSalesAgentOrdersMeasure.Count]: 32 }],
                },
            } as unknown as ReturnType<typeof fetchPostReporting>)
            fetchPostReportingMock.mockResolvedValueOnce({
                data: {
                    ...defaultReporting,
                    data: [{ [AiSalesAgentOrdersMeasure.Count]: 24 }],
                },
            } as unknown as ReturnType<typeof fetchPostReporting>)

            const result = await fetchDiscountCodesAppliedTrend(
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
    })
})
