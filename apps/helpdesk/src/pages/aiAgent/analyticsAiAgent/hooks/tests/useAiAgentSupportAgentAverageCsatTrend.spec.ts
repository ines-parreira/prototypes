import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchStatsMetricTrend,
    useStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { averageAiAgentCsatSupportAgentQueryV2Factory } from 'domains/reporting/models/scopes/aiAgentCsat'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import {
    fetchAiAgentSupportAgentAverageCsatTrend,
    useAiAgentSupportAgentAverageCsatTrend,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportAgentAverageCsatTrend'

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

describe('useAiAgentSupportAgentCsatTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useStatsMetricTrendMock.mockReturnValue(trendData)
    })

    it('should return the result of useStatsMetricTrend', () => {
        const { result } = renderHook(() =>
            useAiAgentSupportAgentAverageCsatTrend(statsFilters, timezone),
        )

        expect(result.current).toEqual(trendData)
    })

    it('should pass current and previous period v2 factories to useStatsMetricTrend', () => {
        renderHook(() =>
            useAiAgentSupportAgentAverageCsatTrend(statsFilters, timezone),
        )

        expect(useStatsMetricTrendMock).toHaveBeenCalledWith(
            averageAiAgentCsatSupportAgentQueryV2Factory({
                filters: statsFilters,
                timezone,
            }),
            averageAiAgentCsatSupportAgentQueryV2Factory({
                filters: {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone,
            }),
        )
    })
})

describe('fetchAiAgentSupportAgentCsatTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        fetchStatsMetricTrendMock.mockResolvedValue(trendData)
    })

    it('should return the result of fetchStatsMetricTrend', async () => {
        const result = await fetchAiAgentSupportAgentAverageCsatTrend(
            statsFilters,
            timezone,
        )

        expect(result).toEqual(trendData)
    })

    it('should pass current and previous period v2 factories to fetchStatsMetricTrend', async () => {
        await fetchAiAgentSupportAgentAverageCsatTrend(statsFilters, timezone)

        expect(fetchStatsMetricTrendMock).toHaveBeenCalledWith(
            averageAiAgentCsatSupportAgentQueryV2Factory({
                filters: statsFilters,
                timezone,
            }),
            averageAiAgentCsatSupportAgentQueryV2Factory({
                filters: {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone,
            }),
        )
    })
})
