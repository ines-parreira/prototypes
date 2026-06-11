import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchStatsMetricTrend,
    useStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { averageAiAgentCsatQueryV2Factory } from 'domains/reporting/models/scopes/aiAgentCsat'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import {
    fetchAiAgentAllAgentsAverageCsatTrend,
    useAiAgentAllAgentsAverageCsatTrend,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsAverageCsatTrend'

jest.mock('domains/reporting/hooks/useStatsMetricTrend')

const useStatsMetricTrendMock = assumeMock(useStatsMetricTrend)
const fetchStatsMetricTrendMock = assumeMock(fetchStatsMetricTrend)

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00.000',
        end_datetime: '2024-01-31T23:59:59.999',
    },
}
const timezone = 'UTC'

const trendData = {
    data: { value: 4.2, prevValue: 3.8 },
    isFetching: false,
    isError: false,
}

describe('useAiAgentCsatTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useStatsMetricTrendMock.mockReturnValue(trendData)
    })

    it('should return the result of useStatsMetricTrend', () => {
        const { result } = renderHook(() =>
            useAiAgentAllAgentsAverageCsatTrend(statsFilters, timezone),
        )

        expect(result.current).toEqual(trendData)
    })

    it('should pass current and previous period v2 factories to useStatsMetricTrend', () => {
        renderHook(() =>
            useAiAgentAllAgentsAverageCsatTrend(statsFilters, timezone),
        )

        expect(useStatsMetricTrendMock).toHaveBeenCalledWith(
            averageAiAgentCsatQueryV2Factory({
                filters: statsFilters,
                timezone,
            }),
            averageAiAgentCsatQueryV2Factory({
                filters: {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone,
            }),
        )
    })
})

describe('fetchAiAgentCsatTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        fetchStatsMetricTrendMock.mockResolvedValue(trendData)
    })

    it('should return the result of fetchStatsMetricTrend', async () => {
        const result = await fetchAiAgentAllAgentsAverageCsatTrend(
            statsFilters,
            timezone,
        )

        expect(result).toEqual(trendData)
    })

    it('should pass current and previous period v2 factories to fetchStatsMetricTrend', async () => {
        await fetchAiAgentAllAgentsAverageCsatTrend(statsFilters, timezone)

        expect(fetchStatsMetricTrendMock).toHaveBeenCalledWith(
            averageAiAgentCsatQueryV2Factory({
                filters: statsFilters,
                timezone,
            }),
            averageAiAgentCsatQueryV2Factory({
                filters: {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone,
            }),
        )
    })
})
