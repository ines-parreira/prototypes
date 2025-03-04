import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks/dom'
import moment from 'moment'

import { StatsFilters } from 'models/stat/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import {
    fetchGmvInfluecedTrend,
    useGmvInfluecedTrend,
} from '../useGmvInfluecedTrend'
import { fetchRoiRateTrend, useRoiRateTrend } from '../useRoiRateTrend'
import {
    fetchTotalAIConvTrend,
    useTotalAIConvTrend,
} from '../useTotalAIConvTrend'

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

jest.mock('pages/stats/aiSalesAgent/metrics/useGmvInfluecedTrend')
const useGmvInfluecedTrendMock = assumeMock(useGmvInfluecedTrend)
const fetchGmvInfluecedTrendMock = assumeMock(fetchGmvInfluecedTrend)

jest.mock('pages/stats/aiSalesAgent/metrics/useTotalAIConvTrend')
const useTotalAIConvTrendMock = assumeMock(useTotalAIConvTrend)
const fetchTotalAIConvTrendMock = assumeMock(fetchTotalAIConvTrend)

describe('roiRateTrend', () => {
    describe('useRoiRateTrend', () => {
        it('should return correct metric data when the query resolves', async () => {
            act(() => jest.runAllTimers())

            useGmvInfluecedTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 10,
                    prevValue: 2,
                },
            })
            useTotalAIConvTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 2,
                    prevValue: 1,
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
                        prevValue: 2.7,
                        value: 6.75,
                    },
                    isError: false,
                    isFetching: false,
                })
            })
        })

        it('should retrun correct value if cube returns null', async () => {
            act(() => jest.runAllTimers())

            useGmvInfluecedTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: null,
                    prevValue: null,
                },
            })
            useTotalAIConvTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
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
        it('should return correct metric data when the query resolves', async () => {
            act(() => jest.runAllTimers())

            fetchGmvInfluecedTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 10,
                    prevValue: 2,
                },
            } as unknown as ReturnType<typeof fetchGmvInfluecedTrend>)
            fetchTotalAIConvTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 2,
                    prevValue: 1,
                },
            } as unknown as ReturnType<typeof fetchTotalAIConvTrendMock>)

            const result = await fetchRoiRateTrend(filters, timezone)

            expect(result).toEqual({
                data: {
                    prevValue: 2.7,
                    value: 6.75,
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should retrun correct value if cube returns null', async () => {
            act(() => jest.runAllTimers())

            fetchGmvInfluecedTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: null,
                    prevValue: null,
                },
            } as unknown as ReturnType<typeof fetchGmvInfluecedTrend>)
            fetchTotalAIConvTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    value: null,
                    prevValue: null,
                },
            } as unknown as ReturnType<typeof fetchTotalAIConvTrendMock>)

            const result = await fetchRoiRateTrend(filters, timezone)

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
