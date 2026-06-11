import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchStatsMetricTrend,
    useStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicMedianTimeSavedByAgentQueryFactoryV2 } from 'domains/reporting/models/scopes/overallTimeSavedByAgent'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import {
    fetchOverallTimeSavedByAgentsTrend,
    useOverallTimeSavedByAgentsTrend,
} from 'pages/aiAgent/analyticsOverview/hooks/useOverallTimeSavedByAgentsTrend'

jest.mock('domains/reporting/hooks/useStatsMetricTrend')

const mockUseStatsMetricTrend = assumeMock(useStatsMetricTrend)
const mockFetchStatsMetricTrend = assumeMock(fetchStatsMetricTrend)

const mockFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
} as StatsFilters

const timezone = 'UTC'

const mockTrend = {
    isFetching: false,
    isError: false,
    data: { value: 120, prevValue: 95 },
}

describe('useOverallTimeSavedByAgentsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStatsMetricTrend.mockReturnValue(mockTrend)
    })

    const renderTimeSavedTrendHook = () =>
        renderHook(() =>
            useOverallTimeSavedByAgentsTrend(mockFilters, timezone),
        )

    it('should call useStatsMetricTrend with current and previous period V2 queries', () => {
        renderTimeSavedTrendHook()

        expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
            dynamicMedianTimeSavedByAgentQueryFactoryV2({
                filters: mockFilters,
                timezone,
            }),
            dynamicMedianTimeSavedByAgentQueryFactoryV2({
                filters: {
                    ...mockFilters,
                    period: getPreviousPeriod(mockFilters.period),
                },
                timezone,
            }),
        )
    })

    it('should return the trend result', () => {
        const { result } = renderTimeSavedTrendHook()

        expect(result.current).toBe(mockTrend)
    })

    it('should propagate isFetching=true from trend', () => {
        mockUseStatsMetricTrend.mockReturnValue({
            ...mockTrend,
            isFetching: true,
        })

        const { result } = renderTimeSavedTrendHook()

        expect(result.current.isFetching).toBe(true)
    })

    it('should propagate isError=true from trend', () => {
        mockUseStatsMetricTrend.mockReturnValue({
            ...mockTrend,
            isError: true,
        })

        const { result } = renderTimeSavedTrendHook()

        expect(result.current.isError).toBe(true)
    })
})

describe('fetchOverallTimeSavedByAgentsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFetchStatsMetricTrend.mockResolvedValue(mockTrend)
    })

    it('should call fetchStatsMetricTrend with current and previous period V2 queries', async () => {
        await fetchOverallTimeSavedByAgentsTrend(mockFilters, timezone)

        expect(mockFetchStatsMetricTrend).toHaveBeenCalledWith(
            dynamicMedianTimeSavedByAgentQueryFactoryV2({
                filters: mockFilters,
                timezone,
            }),
            dynamicMedianTimeSavedByAgentQueryFactoryV2({
                filters: {
                    ...mockFilters,
                    period: getPreviousPeriod(mockFilters.period),
                },
                timezone,
            }),
        )
    })

    it('should return the trend result', async () => {
        const result = await fetchOverallTimeSavedByAgentsTrend(
            mockFilters,
            timezone,
        )

        expect(result).toBe(mockTrend)
    })
})
