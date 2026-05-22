import { renderHook } from '@repo/testing'

import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicAllAgentsAutomationRateQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomationRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import {
    fetchAiAgentAllAgentsAutomationRateTrend,
    useAiAgentAllAgentsAutomationRateTrend,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsAutomationRateTrend'

jest.mock('domains/reporting/hooks/useStatsMetricTrend', () => ({
    __esModule: true,
    default: jest.fn(),
    fetchStatsMetricTrend: jest.fn(),
}))

const mockUseStatsMetricTrend = jest.mocked(useStatsMetricTrend)
const mockFetchStatsMetricTrend = jest.mocked(fetchStatsMetricTrend)

const mockFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}

const mockTimezone = 'America/New_York'

const mockTrend = {
    data: { value: 0.5, prevValue: 0.4 },
    isFetching: false,
    isError: false,
}

describe('useAiAgentAllAgentsAutomationRateTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStatsMetricTrend.mockReturnValue(mockTrend)
    })

    it('calls useStatsMetricTrend with current and previous period V2 queries', () => {
        renderHook(() =>
            useAiAgentAllAgentsAutomationRateTrend(mockFilters, mockTimezone),
        )

        expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
            dynamicAllAgentsAutomationRateQueryFactoryV2({
                filters: mockFilters,
                timezone: mockTimezone,
            }),
            dynamicAllAgentsAutomationRateQueryFactoryV2({
                filters: {
                    ...mockFilters,
                    period: getPreviousPeriod(mockFilters.period),
                },
                timezone: mockTimezone,
            }),
        )
    })

    it('returns the trend result', () => {
        const { result } = renderHook(() =>
            useAiAgentAllAgentsAutomationRateTrend(mockFilters, mockTimezone),
        )

        expect(result.current).toEqual(mockTrend)
    })
})

describe('fetchAiAgentAllAgentsAutomationRateTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFetchStatsMetricTrend.mockResolvedValue(mockTrend)
    })

    it('calls fetchStatsMetricTrend with current and previous period V2 queries', async () => {
        await fetchAiAgentAllAgentsAutomationRateTrend(
            mockFilters,
            mockTimezone,
        )

        expect(mockFetchStatsMetricTrend).toHaveBeenCalledWith(
            dynamicAllAgentsAutomationRateQueryFactoryV2({
                filters: mockFilters,
                timezone: mockTimezone,
            }),
            dynamicAllAgentsAutomationRateQueryFactoryV2({
                filters: {
                    ...mockFilters,
                    period: getPreviousPeriod(mockFilters.period),
                },
                timezone: mockTimezone,
            }),
        )
    })

    it('returns the trend result', async () => {
        const result = await fetchAiAgentAllAgentsAutomationRateTrend(
            mockFilters,
            mockTimezone,
        )

        expect(result).toEqual(mockTrend)
    })
})
