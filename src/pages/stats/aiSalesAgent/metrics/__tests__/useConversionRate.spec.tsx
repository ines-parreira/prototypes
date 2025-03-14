import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks/dom'
import moment from 'moment'

import { StatsFilters } from 'models/stat/types'
import {
    fetchTotalNumberOfOrders,
    useTotalNumberOfOrders,
} from 'pages/stats/aiSalesAgent/metrics/useTotalNumberOfOrders'
import {
    fetchTotalSalesOpportunityAIConvTrend,
    useTotalSalesOpportunityAIConvTrend,
} from 'pages/stats/aiSalesAgent/metrics/useTotalSalesOpportunityAIConvTrend'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import { fetchConversionRate, useConversionRate } from '../useConversionRate'

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
    'pages/stats/aiSalesAgent/metrics/useTotalSalesOpportunityAIConvTrend',
)
const useTotalSalesOpportunityAIConvTrendMock = assumeMock(
    useTotalSalesOpportunityAIConvTrend,
)
const useTotalNumberOfOrdersMock = assumeMock(useTotalNumberOfOrders)

jest.mock('pages/stats/aiSalesAgent/metrics/useTotalNumberOfOrders')
const fetchTotalSalesOpportunityAIConvTrendMock = assumeMock(
    fetchTotalSalesOpportunityAIConvTrend,
)
const fetchTotalNumberOfOrdersMock = assumeMock(fetchTotalNumberOfOrders)

describe('conversionRate', () => {
    describe('useConversionRate', () => {
        it('should return correct metric data when the query resolves', async () => {
            act(() => jest.runAllTimers())

            useTotalSalesOpportunityAIConvTrendMock.mockReturnValue({
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
                () => useConversionRate(filters, timezone),
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

            useTotalSalesOpportunityAIConvTrendMock.mockReturnValue({
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
                () => useConversionRate(filters, timezone),
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

    describe('fetchConversionRate', () => {
        it('should return correct metric data when the query resolves', async () => {
            act(() => jest.runAllTimers())

            fetchTotalSalesOpportunityAIConvTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 10,
                    prevValue: 2,
                },
            } as unknown as ReturnType<
                typeof fetchTotalSalesOpportunityAIConvTrend
            >)
            fetchTotalNumberOfOrdersMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 2,
                    prevValue: 1,
                },
            } as unknown as ReturnType<typeof fetchTotalNumberOfOrders>)

            const result = await fetchConversionRate(filters, timezone)

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

            fetchTotalSalesOpportunityAIConvTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: null,
                    prevValue: null,
                },
            } as unknown as ReturnType<
                typeof fetchTotalSalesOpportunityAIConvTrend
            >)
            fetchTotalNumberOfOrdersMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: null,
                    prevValue: null,
                },
            } as unknown as ReturnType<typeof fetchTotalNumberOfOrders>)

            const result = await fetchConversionRate(filters, timezone)

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
