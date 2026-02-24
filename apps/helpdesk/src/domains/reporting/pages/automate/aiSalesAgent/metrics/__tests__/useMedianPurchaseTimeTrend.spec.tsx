import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchStatsMetric,
    useStatsMetric,
} from 'domains/reporting/hooks/useStatsMetric'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchMedianPurchaseTimeTrend,
    useMedianPurchaseTimeTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useMedianPerchaseTimeTrend'

const timezone = 'UTC'

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00.000',
        end_datetime: '2024-01-31T23:59:59.999',
    },
}

jest.mock('domains/reporting/hooks/useStatsMetric')

const useStatsMetricMock = assumeMock(useStatsMetric)
const fetchStatsMetricMock = assumeMock(fetchStatsMetric)

describe('MedianPurchaseTimeTrend', () => {
    const defaultMetric = {
        isFetching: false,
        isError: false,
        data: undefined,
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    describe('useMedianPurchaseTimeTrend', () => {
        it('should return correct metric data when the query resolves', () => {
            useStatsMetricMock.mockReturnValueOnce({
                ...defaultMetric,
                data: { value: 45 },
            })
            useStatsMetricMock.mockReturnValueOnce({
                ...defaultMetric,
                data: { value: 38 },
            })

            const { result } = renderHook(() =>
                useMedianPurchaseTimeTrend(statsFilters, timezone),
            )

            expect(result.current).toEqual({
                data: {
                    value: 45,
                    prevValue: 38,
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should pass current and previous period queries to useStatsMetric', () => {
            useStatsMetricMock.mockReturnValue(defaultMetric)

            renderHook(() => useMedianPurchaseTimeTrend(statsFilters, timezone))

            expect(useStatsMetricMock).toHaveBeenCalledTimes(2)

            const [currentQuery, prevQuery] = useStatsMetricMock.mock.calls.map(
                ([query]) => query,
            )

            expect(currentQuery.measures).toEqual(['medianPurchaseTime'])
            expect(prevQuery.measures).toEqual(['medianPurchaseTime'])
            expect(currentQuery.metricName).toBe(
                'ai-sales-agent-median-purchase-time',
            )
            expect(prevQuery.metricName).toBe(
                'ai-sales-agent-median-purchase-time',
            )
        })
    })

    describe('fetchMedianPurchaseTimeTrend', () => {
        it('should return the correct data when the query resolves', async () => {
            fetchStatsMetricMock.mockResolvedValueOnce({
                ...defaultMetric,
                data: { value: 45 },
            })
            fetchStatsMetricMock.mockResolvedValueOnce({
                ...defaultMetric,
                data: { value: 38 },
            })

            const result = await fetchMedianPurchaseTimeTrend(
                statsFilters,
                timezone,
            )

            expect(result).toEqual({
                data: {
                    value: 45,
                    prevValue: 38,
                },
                isError: false,
                isFetching: false,
            })
        })
    })
})
