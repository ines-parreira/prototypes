import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks/dom'
import moment from 'moment'

import {
    fetchMultipleMetricsTrends,
    MultipleMetricsData,
    useMultipleMetricsTrends,
} from 'hooks/reporting/useMultipleMetricsTrend'
import { Cubes } from 'models/reporting/cubes'
import { AiSalesAgentOrdersMeasure } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { StatsFilters } from 'models/stat/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import {
    fetchAverageOrderValueTrend,
    useAverageOrderValueTrend,
} from '../useAverageOrderValueTrend'

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

jest.useFakeTimers()

jest.mock('hooks/reporting/useMultipleMetricsTrend')
const useMultipleMetricsTrendsMock = assumeMock(useMultipleMetricsTrends)
const fetchMultipleMetricsTrendsMock = assumeMock(fetchMultipleMetricsTrends)

describe('averageOrderValueTrend', () => {
    describe('useAverageOrderValueTrend', () => {
        beforeEach(() => {
            useMultipleMetricsTrendsMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    [AiSalesAgentOrdersMeasure.GmvUsd]: {
                        value: 10,
                        prevValue: 2,
                    },
                    [AiSalesAgentOrdersMeasure.Count]: {
                        value: 2,
                        prevValue: 1,
                    },
                },
            } as unknown as ReturnType<typeof useMultipleMetricsTrends>)
        })

        it('should return correct metric data when the query resolves', async () => {
            act(() => jest.runAllTimers())

            const { result } = renderHook(
                () => useAverageOrderValueTrend(statsFilters, timezone),
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
                        prevValue: 2,
                        value: 5,
                    },
                    isError: false,
                    isFetching: false,
                })
            })
        })
    })

    describe('fetchAverageOrderValueTrend', () => {
        beforeEach(() => {
            fetchMultipleMetricsTrendsMock.mockResolvedValue({
                data: {
                    [AiSalesAgentOrdersMeasure.GmvUsd]: {
                        value: 10,
                        prevValue: 2,
                    },
                    [AiSalesAgentOrdersMeasure.Count]: {
                        value: 2,
                        prevValue: 1,
                    },
                } as unknown as MultipleMetricsData<Cubes>,
                isFetching: false,
                isError: false,
            })
        })

        it('should return correct metric data when the query resolves', async () => {
            const result = await fetchAverageOrderValueTrend(
                statsFilters,
                timezone,
            )

            expect(result).toEqual({
                data: {
                    prevValue: 2,
                    value: 5,
                },
                isFetching: false,
                isError: false,
            })
        })
    })
})
