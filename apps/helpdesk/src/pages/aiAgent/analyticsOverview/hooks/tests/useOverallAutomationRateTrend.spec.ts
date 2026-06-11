import { renderHook } from '@repo/testing'

import {
    fetchStatsMetricTrend,
    useStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicOverallAutomationRateQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomationRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import {
    fetchOverallAutomationRateTrend,
    useOverallAutomationRateTrend,
} from 'pages/aiAgent/analyticsOverview/hooks/useOverallAutomationRateTrend'

jest.mock('domains/reporting/hooks/useStatsMetricTrend', () => ({
    __esModule: true,
    useStatsMetricTrend: jest.fn(),
    fetchStatsMetricTrend: jest.fn(),
}))

const mockUseStatsMetricTrend = jest.mocked(useStatsMetricTrend)
const mockFetchStatsMetricTrend = jest.mocked(fetchStatsMetricTrend)

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2026-01-01T00:00:00.000',
        end_datetime: '2026-01-31T23:59:59.999',
    },
}
const timezone = 'UTC'

const mockTrend = {
    data: { value: 0.6, prevValue: 0.5 },
    isFetching: false,
    isError: false,
}

describe('useOverallAutomationRateTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStatsMetricTrend.mockReturnValue(mockTrend)
    })

    it('calls useStatsMetricTrend with current and previous period V2 queries', () => {
        renderHook(() => useOverallAutomationRateTrend(statsFilters, timezone))

        expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
            dynamicOverallAutomationRateQueryFactoryV2({
                filters: statsFilters,
                timezone,
            }),
            dynamicOverallAutomationRateQueryFactoryV2({
                filters: {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone,
            }),
        )
    })

    it('returns the trend result', () => {
        const { result } = renderHook(() =>
            useOverallAutomationRateTrend(statsFilters, timezone),
        )

        expect(result.current).toEqual(mockTrend)
    })
})

describe('fetchOverallAutomationRateTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFetchStatsMetricTrend.mockResolvedValue(mockTrend)
    })

    it('calls fetchStatsMetricTrend with current and previous period V2 queries', async () => {
        await fetchOverallAutomationRateTrend(statsFilters, timezone)

        expect(mockFetchStatsMetricTrend).toHaveBeenCalledWith(
            dynamicOverallAutomationRateQueryFactoryV2({
                filters: statsFilters,
                timezone,
            }),
            dynamicOverallAutomationRateQueryFactoryV2({
                filters: {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone,
            }),
        )
    })

    it('returns the trend result', async () => {
        const result = await fetchOverallAutomationRateTrend(
            statsFilters,
            timezone,
        )

        expect(result).toEqual(mockTrend)
    })
})
