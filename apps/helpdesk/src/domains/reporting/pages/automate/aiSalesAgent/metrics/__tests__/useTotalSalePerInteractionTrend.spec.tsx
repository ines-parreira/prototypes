import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import moment from 'moment'

import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchGmvInfluencedTrend,
    useGmvInfluencedTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import {
    fetchTotalNumberOfSalesConversationsTrend,
    useTotalNumberOfSalesConversationsTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfSalesConversationsTrend'
import {
    fetchTotalSalePerInteractionTrend,
    useTotalSalePerInteractionTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalSalePerInteractionTrend'
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
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend',
)
const useGmvInfluencedTrendMock = assumeMock(useGmvInfluencedTrend)
const fetchGmvInfluencedTrendMock = assumeMock(fetchGmvInfluencedTrend)

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfSalesConversationsTrend',
)
const useTotalNumberOfSalesConversationsTrendMock = assumeMock(
    useTotalNumberOfSalesConversationsTrend,
)
const fetchTotalNumberOfSalesConversationsTrendMock = assumeMock(
    fetchTotalNumberOfSalesConversationsTrend,
)

describe('totalSalePerInteractionTrend', () => {
    describe('useTotalSalePerInteractionTrend', () => {
        beforeEach(() => {
            useGmvInfluencedTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 1000,
                    prevValue: 800,
                    currency: 'USD',
                },
            })
            useTotalNumberOfSalesConversationsTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 10,
                    prevValue: 8,
                },
            })
        })

        it('should return correct metric data when the query resolves', async () => {
            act(() => jest.runAllTimers())

            const { result } = renderHook(
                () => useTotalSalePerInteractionTrend(filters, timezone),
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
                        prevValue: 100,
                        value: 100,
                    },
                    isError: false,
                    isFetching: false,
                })
            })
        })

        it('should return correct value if cube returns null', async () => {
            act(() => jest.runAllTimers())

            useGmvInfluencedTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: null,
                    prevValue: null,
                    currency: 'USD',
                },
            } as unknown as ReturnType<typeof useGmvInfluencedTrend>)

            useTotalNumberOfSalesConversationsTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: null,
                    prevValue: null,
                },
            })

            const { result } = renderHook(
                () => useTotalSalePerInteractionTrend(filters, timezone),
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

        it('should handle division by zero when sales conversations is zero', async () => {
            act(() => jest.runAllTimers())

            useGmvInfluencedTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 1000,
                    prevValue: 800,
                    currency: 'USD',
                },
            })

            useTotalNumberOfSalesConversationsTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 0,
                    prevValue: 0,
                },
            })

            const { result } = renderHook(
                () => useTotalSalePerInteractionTrend(filters, timezone),
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

        it('should return isFetching true when any dependency is fetching', async () => {
            act(() => jest.runAllTimers())

            useGmvInfluencedTrendMock.mockReturnValue({
                isFetching: true,
                isError: false,
                data: {
                    value: 1000,
                    prevValue: 800,
                    currency: 'USD',
                },
            })

            useTotalNumberOfSalesConversationsTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 10,
                    prevValue: 8,
                },
            })

            const { result } = renderHook(
                () => useTotalSalePerInteractionTrend(filters, timezone),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    ),
                },
            )

            await waitFor(() => {
                expect(result.current.isFetching).toBe(true)
            })
        })

        it('should return isError true when any dependency has error', async () => {
            act(() => jest.runAllTimers())

            useGmvInfluencedTrendMock.mockReturnValue({
                isFetching: false,
                isError: true,
                data: {
                    value: 1000,
                    prevValue: 800,
                    currency: 'USD',
                },
            })

            useTotalNumberOfSalesConversationsTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 10,
                    prevValue: 8,
                },
            })

            const { result } = renderHook(
                () => useTotalSalePerInteractionTrend(filters, timezone),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    ),
                },
            )

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
            })
        })
    })

    describe('fetchTotalSalePerInteractionTrend', () => {
        beforeEach(() => {
            fetchGmvInfluencedTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 1000,
                    prevValue: 800,
                    currency: 'USD',
                },
            } as unknown as ReturnType<typeof fetchGmvInfluencedTrend>)
            fetchTotalNumberOfSalesConversationsTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 10,
                    prevValue: 8,
                },
            } as unknown as ReturnType<
                typeof fetchTotalNumberOfSalesConversationsTrend
            >)
        })

        it('should return correct metric data when the query resolves', async () => {
            act(() => jest.runAllTimers())

            const result = await fetchTotalSalePerInteractionTrend(
                filters,
                timezone,
            )

            expect(result).toEqual({
                data: {
                    prevValue: 100,
                    value: 100,
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should return correct value if cube returns null', async () => {
            act(() => jest.runAllTimers())

            fetchGmvInfluencedTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: { value: null, prevValue: null, currency: 'USD' },
            } as unknown as ReturnType<typeof fetchGmvInfluencedTrend>)

            fetchTotalNumberOfSalesConversationsTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    prevValue: null,
                    value: null,
                },
            } as unknown as ReturnType<
                typeof fetchTotalNumberOfSalesConversationsTrend
            >)

            const result = await fetchTotalSalePerInteractionTrend(
                filters,
                timezone,
            )

            expect(result).toEqual({
                data: {
                    prevValue: 0,
                    value: 0,
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should handle division by zero when sales conversations is zero', async () => {
            act(() => jest.runAllTimers())

            fetchGmvInfluencedTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 1000,
                    prevValue: 800,
                    currency: 'USD',
                },
            } as unknown as ReturnType<typeof fetchGmvInfluencedTrend>)

            fetchTotalNumberOfSalesConversationsTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 0,
                    prevValue: 0,
                },
            } as unknown as ReturnType<
                typeof fetchTotalNumberOfSalesConversationsTrend
            >)

            const result = await fetchTotalSalePerInteractionTrend(
                filters,
                timezone,
            )

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
