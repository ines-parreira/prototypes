import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import moment from 'moment'

import type { MultipleMetricsData } from 'domains/reporting/hooks/useMultipleMetricsTrend'
import {
    fetchMultipleMetricsTrends,
    useMultipleMetricsTrends,
} from 'domains/reporting/hooks/useMultipleMetricsTrend'
import type { Cubes } from 'domains/reporting/models/cubes'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchAverageOrderValueTrend,
    useAverageOrderValueTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useAverageOrderValueTrend'
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

jest.useFakeTimers()

jest.mock('domains/reporting/hooks/useMultipleMetricsTrend')
const useMultipleMetricsTrendsMock = assumeMock(useMultipleMetricsTrends)
const fetchMultipleMetricsTrendsMock = assumeMock(fetchMultipleMetricsTrends)

describe('averageOrderValueTrend', () => {
    describe('useAverageOrderValueTrend', () => {
        beforeEach(() => {
            useMultipleMetricsTrendsMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: {
                    [AiSalesAgentOrdersMeasure.Gmv]: {
                        value: 10,
                        prevValue: 2,
                        rawData: {
                            [AiSalesAgentOrdersDimension.Currency]: 'EUR',
                        },
                    },
                    [AiSalesAgentOrdersMeasure.Count]: {
                        value: 2,
                        prevValue: 1,
                        rawData: {},
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
                        currency: 'EUR',
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
                    [AiSalesAgentOrdersMeasure.Gmv]: {
                        value: 10,
                        prevValue: 2,
                        rawData: {
                            [AiSalesAgentOrdersDimension.Currency]: 'EUR',
                        },
                    },
                    [AiSalesAgentOrdersMeasure.Count]: {
                        value: 2,
                        prevValue: 1,
                        rawData: {},
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
                    currency: 'EUR',
                },
                isFetching: false,
                isError: false,
            })
        })
    })
})
