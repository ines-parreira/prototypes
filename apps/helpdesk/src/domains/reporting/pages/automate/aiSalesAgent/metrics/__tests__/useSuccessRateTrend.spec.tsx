import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import moment from 'moment'

import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchSuccessRateTrend,
    useSuccessRateTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useSuccessRateTrend'
import {
    fetchTotalNumberOfAutomatedSalesTrend,
    useTotalNumberOfAutomatedSalesTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfAutomatedSalesTrend'
import {
    fetchTotalNumberOfSalesConversationsTrend,
    useTotalNumberOfSalesConversationsTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfSalesConversationsTrend'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

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
const fetchTotalNumberOfAgentConverationsTrendMock = assumeMock(
    fetchTotalNumberOfSalesConversationsTrend,
)

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfAutomatedSalesTrend',
)
const useTotalNumberOfAutomatedSalesTrendMock = assumeMock(
    useTotalNumberOfAutomatedSalesTrend,
)
const fetchTotalNumberOfAutomatedSalesTrendMock = assumeMock(
    fetchTotalNumberOfAutomatedSalesTrend,
)

describe('successRateTrend', () => {
    describe('useSuccessRateTrend', () => {
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
            useTotalNumberOfAutomatedSalesTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 2,
                    prevValue: 1,
                },
            })

            const { result } = renderHook(
                () => useSuccessRateTrend(filters, timezone),
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
            useTotalNumberOfAutomatedSalesTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: null,
                    prevValue: null,
                },
            })

            const { result } = renderHook(
                () => useSuccessRateTrend(filters, timezone),
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

    describe('fetchSuccessRateTrend', () => {
        it('should return correct metric data when the query resolves', async () => {
            act(() => jest.runAllTimers())

            fetchTotalNumberOfAgentConverationsTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 10,
                    prevValue: 2,
                },
            } as unknown as ReturnType<
                typeof fetchTotalNumberOfSalesConversationsTrend
            >)
            fetchTotalNumberOfAutomatedSalesTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 2,
                    prevValue: 1,
                },
            } as unknown as ReturnType<
                typeof fetchTotalNumberOfAutomatedSalesTrend
            >)

            const result = await fetchSuccessRateTrend(filters, timezone)

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

            fetchTotalNumberOfAgentConverationsTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: null,
                    prevValue: null,
                },
            } as unknown as ReturnType<
                typeof fetchTotalNumberOfSalesConversationsTrend
            >)
            fetchTotalNumberOfAutomatedSalesTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: null,
                    prevValue: null,
                },
            } as unknown as ReturnType<
                typeof fetchTotalNumberOfAutomatedSalesTrend
            >)

            const result = await fetchSuccessRateTrend(filters, timezone)

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
