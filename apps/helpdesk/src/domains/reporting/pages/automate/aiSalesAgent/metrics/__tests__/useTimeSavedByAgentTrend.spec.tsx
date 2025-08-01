import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import moment from 'moment'

import {
    fetchTicketHandleTimeTrend,
    useTicketHandleTimeTrend,
} from 'domains/reporting/hooks/metricTrends'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchSuccessRateTrend,
    useSuccessRateTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useSuccessRateTrend'
import {
    fetchTimeSavedByAgentTrend,
    useTimeSavedByAgentTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTimeSavedByAgentTrend'
import {
    fetchTotalNumberOfSalesConversationsTrend,
    useTotalNumberOfSalesConversationsTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfSalesConversationsTrend'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

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
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfSalesConversationsTrend',
)
const useTotalNumberOfSalesConversationsTrendMock = assumeMock(
    useTotalNumberOfSalesConversationsTrend,
)
const fetchTotalNumberOfSalesConversationsTrendMock = assumeMock(
    fetchTotalNumberOfSalesConversationsTrend,
)

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useSuccessRateTrend',
)
const useSuccessRateTrendMock = assumeMock(useSuccessRateTrend)
const fetchSuccessRateTrendMock = assumeMock(fetchSuccessRateTrend)

jest.mock('domains/reporting/hooks/metricTrends')
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
            useTotalNumberOfSalesConversationsTrendMock.mockReturnValue({
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

            useTotalNumberOfSalesConversationsTrendMock.mockReturnValue({
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
            fetchTotalNumberOfSalesConversationsTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 10,
                    prevValue: 2,
                },
            } as unknown as ReturnType<
                typeof fetchTotalNumberOfSalesConversationsTrend
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

            fetchTotalNumberOfSalesConversationsTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    prevValue: 0,
                    value: 0,
                },
            } as unknown as ReturnType<
                typeof fetchTotalNumberOfSalesConversationsTrend
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
