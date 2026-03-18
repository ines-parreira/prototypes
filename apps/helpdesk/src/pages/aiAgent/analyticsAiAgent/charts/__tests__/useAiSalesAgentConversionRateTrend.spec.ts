import { assumeMock, renderHook } from '@repo/testing'

import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { conversionRateQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentConversionRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import {
    fetchAiSalesAgentConversionRateTrend,
    useAiSalesAgentConversionRateTrend,
} from 'pages/aiAgent/analyticsAiAgent/charts/useAiSalesAgentConversionRateTrend'

jest.mock('domains/reporting/hooks/useStatsMetricTrend')

const fetchStatsMetricTrendMock = assumeMock(fetchStatsMetricTrend)
const useStatsMetricTrendMock = assumeMock(useStatsMetricTrend)

describe('AiSalesAgentConversionRateTrend', () => {
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: '2021-05-29T00:00:00.000',
            end_datetime: '2021-06-04T23:59:59.000',
        },
    }
    const timezone = 'UTC'

    const trendData = {
        data: { value: 0.12, prevValue: 0.1 },
        isFetching: false,
        isError: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        useStatsMetricTrendMock.mockReturnValue(trendData)
        fetchStatsMetricTrendMock.mockResolvedValue(trendData)
    })

    describe('useAiSalesAgentConversionRateTrend', () => {
        it('should return the result of useStatsMetricTrend', () => {
            const { result } = renderHook(() =>
                useAiSalesAgentConversionRateTrend(statsFilters, timezone),
            )

            expect(result.current).toEqual(trendData)
        })

        it('should pass current and previous period query factories to useStatsMetricTrend', () => {
            renderHook(() =>
                useAiSalesAgentConversionRateTrend(statsFilters, timezone),
            )

            expect(useStatsMetricTrendMock).toHaveBeenCalledWith(
                conversionRateQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                }),
                conversionRateQueryV2Factory({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                }),
            )
        })
    })

    describe('fetchAiSalesAgentConversionRateTrend', () => {
        it('should return the result of fetchStatsMetricTrend', async () => {
            const result = await fetchAiSalesAgentConversionRateTrend(
                statsFilters,
                timezone,
            )

            expect(result).toEqual(trendData)
        })

        it('should pass current and previous period query factories to fetchStatsMetricTrend', async () => {
            await fetchAiSalesAgentConversionRateTrend(statsFilters, timezone)

            expect(fetchStatsMetricTrendMock).toHaveBeenCalledWith(
                conversionRateQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                }),
                conversionRateQueryV2Factory({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                }),
            )
        })
    })
})
