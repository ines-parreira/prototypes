import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import moment from 'moment'

import { StatsFilters } from 'models/stat/types'
import {
    fetchTotalNumberOfOrdersTrend,
    useTotalNumberOfOrdersTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useTotalNumberOfOrdersTrend'
import {
    fetchTotalNumberOfSalesConversationsTrend,
    useTotalNumberOfSalesConversationsTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useTotalNumberOfSalesConversationsTrend'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import {
    fetchConversionRateTrend,
    useConversionRateTrend,
} from '../useConversionRateTrend'

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
    'pages/stats/automate/aiSalesAgent/metrics/useTotalNumberOfSalesConversationsTrend',
)
const useTotalNumberOfSalesConversationsTrendMock = assumeMock(
    useTotalNumberOfSalesConversationsTrend,
)
const useTotalNumberOfOrdersMock = assumeMock(useTotalNumberOfOrdersTrend)

jest.mock(
    'pages/stats/automate/aiSalesAgent/metrics/useTotalNumberOfOrdersTrend',
)
const fetchTotalNumberOfSalesConversationsTrendMock = assumeMock(
    fetchTotalNumberOfSalesConversationsTrend,
)
const fetchTotalNumberOfOrdersMock = assumeMock(fetchTotalNumberOfOrdersTrend)

describe('conversionRateTrend', () => {
    describe('useConversionRateTrend', () => {
        it('should return correct metric data when the query resolves', async () => {
            act(() => jest.runAllTimers())

            useTotalNumberOfSalesConversationsTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 10,
                    prevValue: 2,
                },
            })
            useTotalNumberOfOrdersMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 2,
                    prevValue: 1,
                },
            })

            const { result } = renderHook(
                () => useConversionRateTrend(filters, timezone),
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
                        prevValue: 0.5,
                        value: 0.2,
                    },
                    isError: false,
                    isFetching: false,
                })
            })
        })

        it('should retrun correct value if cube returns null', async () => {
            act(() => jest.runAllTimers())

            useTotalNumberOfSalesConversationsTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: null,
                    prevValue: null,
                },
            })
            useTotalNumberOfOrdersMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: null,
                    prevValue: null,
                },
            })

            const { result } = renderHook(
                () => useConversionRateTrend(filters, timezone),
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

    describe('fetchConversionRateTrend', () => {
        it('should return correct metric data when the query resolves', async () => {
            act(() => jest.runAllTimers())

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
            fetchTotalNumberOfOrdersMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 2,
                    prevValue: 1,
                },
            } as unknown as ReturnType<typeof fetchTotalNumberOfOrdersTrend>)

            const result = await fetchConversionRateTrend(filters, timezone)

            expect(result).toEqual({
                data: {
                    prevValue: 0.5,
                    value: 0.2,
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should retrun correct value if cube returns null', async () => {
            act(() => jest.runAllTimers())

            fetchTotalNumberOfSalesConversationsTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: null,
                    prevValue: null,
                },
            } as unknown as ReturnType<
                typeof fetchTotalNumberOfSalesConversationsTrend
            >)
            fetchTotalNumberOfOrdersMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: null,
                    prevValue: null,
                },
            } as unknown as ReturnType<typeof fetchTotalNumberOfOrdersTrend>)

            const result = await fetchConversionRateTrend(filters, timezone)

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
