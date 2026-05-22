import { assumeMock, renderHook } from '@repo/testing'

import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { revenuePerInteractionQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentActivity'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import {
    fetchRevenuePerInteractionMetric,
    useRevenuePerInteractionMetric,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useRevenuePerInteractionMetric'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters')
jest.mock('domains/reporting/hooks/useStatsMetricTrend')

const mockUseAiAgentStatsFilters = assumeMock(useAiAgentStatsFilters)
const mockUseStatsMetricTrend = assumeMock(useStatsMetricTrend)
const mockFetchStatsMetricTrend = assumeMock(fetchStatsMetricTrend)

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00.000',
        end_datetime: '2024-01-31T23:59:59.000',
    },
}
const timezone = 'UTC'

const mockTrend = {
    data: { value: 15.0, prevValue: 12.0 },
    isFetching: false,
    isError: false,
}

describe('useRevenuePerInteractionMetric', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAiAgentStatsFilters.mockReturnValue({
            statsFilters,
            userTimezone: timezone,
            granularity: ReportingGranularity.Day,
        })
        mockUseStatsMetricTrend.mockReturnValue(mockTrend)
    })

    it('should call useStatsMetricTrend with current and previous period V2 queries', () => {
        renderHook(() => useRevenuePerInteractionMetric())

        expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
            revenuePerInteractionQueryV2Factory({
                filters: statsFilters,
                timezone,
            }),
            revenuePerInteractionQueryV2Factory({
                filters: {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone,
            }),
        )
    })

    it('should return trend data with label', () => {
        const { result } = renderHook(() => useRevenuePerInteractionMetric())

        expect(result.current).toEqual({
            isFetching: false,
            isError: false,
            data: {
                label: 'Revenue influenced per interaction',
                value: 15.0,
                prevValue: 12.0,
            },
        })
    })

    it('should return null values when data is undefined', () => {
        mockUseStatsMetricTrend.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() => useRevenuePerInteractionMetric())

        expect(result.current.data?.value).toBeNull()
        expect(result.current.data?.prevValue).toBeNull()
    })

    it('should propagate isFetching=true from trend', () => {
        mockUseStatsMetricTrend.mockReturnValue({
            ...mockTrend,
            isFetching: true,
        })

        const { result } = renderHook(() => useRevenuePerInteractionMetric())

        expect(result.current.isFetching).toBe(true)
    })

    it('should propagate isError=true from trend', () => {
        mockUseStatsMetricTrend.mockReturnValue({
            ...mockTrend,
            isError: true,
        })

        const { result } = renderHook(() => useRevenuePerInteractionMetric())

        expect(result.current.isError).toBe(true)
    })
})

describe('fetchRevenuePerInteractionMetric', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFetchStatsMetricTrend.mockResolvedValue(mockTrend)
    })

    it('should call fetchStatsMetricTrend with current and previous period V2 queries', async () => {
        await fetchRevenuePerInteractionMetric(statsFilters, timezone)

        expect(mockFetchStatsMetricTrend).toHaveBeenCalledWith(
            revenuePerInteractionQueryV2Factory({
                filters: statsFilters,
                timezone,
            }),
            revenuePerInteractionQueryV2Factory({
                filters: {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone,
            }),
        )
    })

    it('should return the trend result', async () => {
        const result = await fetchRevenuePerInteractionMetric(
            statsFilters,
            timezone,
        )

        expect(result).toEqual(mockTrend)
    })
})
