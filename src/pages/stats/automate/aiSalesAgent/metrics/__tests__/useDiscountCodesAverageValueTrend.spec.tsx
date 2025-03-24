import React from 'react'

import { QueryClientProvider, UseQueryResult } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks/dom'
import moment from 'moment'

import { AiSalesAgentOrdersMeasure } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { fetchPostReporting, usePostReporting } from 'models/reporting/queries'
import { StatsFilters } from 'models/stat/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import {
    fetchDiscountCodesAverageValueTrend,
    useDiscountCodesAverageValueTrend,
} from '../useDiscountCodesAverageValueTrend'

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

jest.mock('models/reporting/queries')
const usePostReportingMock = assumeMock(usePostReporting)
const fetchPostReportingMock = assumeMock(fetchPostReporting)

jest.useFakeTimers()

describe('DiscountCodesAverageValueTrend', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    describe('useDiscountCodesAverageValueTrend', () => {
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
                () => useDiscountCodesAverageValueTrend(statsFilters, timezone),
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

        it('should return correct data if clickhouse returns null', async () => {
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: null,
            } as UseQueryResult)
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: 24,
            } as UseQueryResult)

            act(() => jest.runAllTimers())

            const { result } = renderHook(
                () => useDiscountCodesAverageValueTrend(statsFilters, timezone),
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
                        value: 0,
                        prevValue: 24,
                    },
                    isError: false,
                    isFetching: false,
                })
            })
        })
    })
    describe('fetchDiscountCodesAverageValueTrend', () => {
        it('should return the correct data when the query resolves', async () => {
            fetchPostReportingMock.mockReturnValueOnce({
                data: {
                    ...defaultReporting,
                    data: [
                        { [AiSalesAgentOrdersMeasure.AverageDiscountUsd]: 32 },
                    ],
                },
            } as unknown as ReturnType<typeof fetchPostReporting>)
            fetchPostReportingMock.mockReturnValueOnce({
                data: {
                    ...defaultReporting,
                    data: [
                        { [AiSalesAgentOrdersMeasure.AverageDiscountUsd]: 24 },
                    ],
                },
            } as unknown as ReturnType<typeof fetchPostReporting>)

            const result = await fetchDiscountCodesAverageValueTrend(
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

        it('should return correct data if clickhouse returns null', async () => {
            fetchPostReportingMock.mockReturnValueOnce({
                data: {
                    ...defaultReporting,
                    data: [
                        { [AiSalesAgentOrdersMeasure.AverageDiscountUsd]: 32 },
                    ],
                },
            } as unknown as ReturnType<typeof fetchPostReporting>)
            fetchPostReportingMock.mockReturnValueOnce({
                data: {
                    ...defaultReporting,
                    data: [
                        {
                            [AiSalesAgentOrdersMeasure.AverageDiscountUsd]:
                                null,
                        },
                    ],
                },
            } as unknown as ReturnType<typeof fetchPostReporting>)

            const result = await fetchDiscountCodesAverageValueTrend(
                statsFilters,
                timezone,
            )

            expect(result).toEqual({
                data: {
                    value: 32,
                    prevValue: 0,
                },
                isError: false,
                isFetching: false,
            })
        })
    })
})
