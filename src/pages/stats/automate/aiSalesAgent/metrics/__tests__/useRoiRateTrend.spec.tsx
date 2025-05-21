import { QueryClientProvider, UseQueryResult } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import moment from 'moment'

import { StatsFilters } from 'models/stat/types'
import {
    fetchGmvInfluencedTrend,
    useGmvInfluencedTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import {
    fetchTotalNumberOfAutomatedSalesTrend,
    useTotalNumberOfAutomatedSalesTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useTotalNumberOfAutomatedSalesTrend'
import {
    fetchTotalNumberOfSalesConversationsTrend,
    useTotalNumberOfSalesConversationsTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useTotalNumberOfSalesConversationsTrend'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { fetchRoiRateTrend, useRoiRateTrend } from '../useRoiRateTrend'

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
const useTotalAIConvTrendMock = assumeMock(
    useTotalNumberOfSalesConversationsTrend,
)
const fetchTotalAIConvTrendMock = assumeMock(
    fetchTotalNumberOfSalesConversationsTrend,
)

jest.mock('pages/stats/automate/aiSalesAgent/metrics/useGmvInfluencedTrend')
const useGmvInfluencedTrendMock = assumeMock(useGmvInfluencedTrend)
const fetchGmvInfluencedTrendMock = assumeMock(fetchGmvInfluencedTrend)

jest.mock(
    'pages/stats/automate/aiSalesAgent/metrics/useTotalNumberOfAutomatedSalesTrend',
)
const useTotalNumberOfAutomatedSalesTrendMock = assumeMock(
    useTotalNumberOfAutomatedSalesTrend,
)
const fetchTotalNumberOfAutomatedSalesTrendMock = assumeMock(
    fetchTotalNumberOfAutomatedSalesTrend,
)

describe('roiRateTrend', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    describe('useRoiRateTrend', () => {
        beforeEach(() => {
            useGmvInfluencedTrendMock.mockReturnValue({
                ...defaultReporting,
                data: {
                    value: 200,
                    prevValue: 100,
                },
            })
            useTotalNumberOfAutomatedSalesTrendMock.mockReturnValue({
                ...defaultReporting,
                data: {
                    value: 10,
                    prevValue: 5,
                },
            })
        })

        it('should return correct metric data when the query resolves', async () => {
            act(() => jest.runAllTimers())

            useTotalAIConvTrendMock.mockReturnValue({
                ...defaultReporting,
                data: {
                    value: 5,
                    prevValue: 2,
                },
            })

            const { result } = renderHook(
                () => useRoiRateTrend(filters, timezone),
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
                        prevValue: 18.51851851851852,
                        value: 18.181818181818183,
                    },
                    isError: false,
                    isFetching: false,
                })
            })
        })

        it('should return correct value if cube returns null', async () => {
            act(() => jest.runAllTimers())

            useTotalNumberOfAutomatedSalesTrendMock.mockReturnValue({
                ...defaultReporting,
                data: {
                    value: null,
                    prevValue: null,
                },
            })

            useTotalAIConvTrendMock.mockReturnValue({
                ...defaultReporting,
                data: {
                    value: null,
                    prevValue: null,
                },
            })

            const { result } = renderHook(
                () => useRoiRateTrend(filters, timezone),
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

    describe('fetchRoiRateTrend', () => {
        beforeEach(() => {
            fetchGmvInfluencedTrendMock.mockReturnValue({
                ...defaultReporting,
                data: {
                    value: 200,
                    prevValue: 100,
                },
            } as unknown as ReturnType<typeof fetchGmvInfluencedTrend>)
            fetchTotalNumberOfAutomatedSalesTrendMock.mockReturnValue({
                ...defaultReporting,
                data: {
                    value: 10,
                    prevValue: 5,
                },
            } as unknown as ReturnType<
                typeof fetchTotalNumberOfAutomatedSalesTrend
            >)
        })

        it('should return correct metric data when the query resolves', async () => {
            act(() => jest.runAllTimers())

            fetchTotalAIConvTrendMock.mockReturnValue({
                ...defaultReporting,
                data: {
                    value: 5,
                    prevValue: 2,
                },
            } as unknown as ReturnType<typeof fetchTotalAIConvTrendMock>)

            const result = await fetchRoiRateTrend(filters, timezone)

            expect(result).toEqual({
                data: {
                    prevValue: 18.51851851851852,
                    value: 18.181818181818183,
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should retrun correct value if cube returns null', async () => {
            act(() => jest.runAllTimers())

            fetchTotalAIConvTrendMock.mockReturnValue({
                ...defaultReporting,
                data: {
                    value: null,
                    prevValue: null,
                },
            } as unknown as ReturnType<typeof fetchTotalAIConvTrendMock>)

            const result = await fetchRoiRateTrend(filters, timezone)

            expect(result).toEqual({
                data: {
                    prevValue: 20,
                    value: 20,
                },
                isError: false,
                isFetching: false,
            })
        })
    })
})
