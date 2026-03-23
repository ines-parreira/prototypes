import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchAiAgentBuyThroughRateTrend,
    useAiAgentBuyThroughRateTrend,
} from 'domains/reporting/hooks/automate/useAiAgentBuyThroughRateTrend'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { buyThroughRateQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentBuyThroughRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useStatsMetricTrend')

const fetchStatsMetricTrendMock = assumeMock(fetchStatsMetricTrend)
const useStatsMetricTrendMock = assumeMock(useStatsMetricTrend)

describe('AiAgentBuyThroughRateTrend', () => {
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: '2021-05-29T00:00:00.000',
            end_datetime: '2021-06-04T23:59:59.000',
        },
    }
    const timezone = 'UTC'

    const trendData = {
        data: { value: 0.45, prevValue: 0.3 },
        isFetching: false,
        isError: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        useStatsMetricTrendMock.mockReturnValue(trendData)
        fetchStatsMetricTrendMock.mockResolvedValue(trendData)
    })

    describe('useAiAgentBuyThroughRateTrend', () => {
        it('should return the result of useStatsMetricTrend', () => {
            const { result } = renderHook(() =>
                useAiAgentBuyThroughRateTrend(statsFilters, timezone),
            )

            expect(result.current).toEqual(trendData)
        })

        it('should pass current and previous period query factories to useStatsMetricTrend', () => {
            renderHook(() =>
                useAiAgentBuyThroughRateTrend(statsFilters, timezone),
            )

            expect(useStatsMetricTrendMock).toHaveBeenCalledWith(
                buyThroughRateQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                }),
                buyThroughRateQueryV2Factory({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                }),
            )
        })
    })

    describe('fetchAiAgentBuyThroughRateTrend', () => {
        it('should return the result of fetchStatsMetricTrend', async () => {
            const result = await fetchAiAgentBuyThroughRateTrend(
                statsFilters,
                timezone,
            )

            expect(result).toEqual(trendData)
        })

        it('should pass current and previous period query factories to fetchStatsMetricTrend', async () => {
            await fetchAiAgentBuyThroughRateTrend(statsFilters, timezone)

            expect(fetchStatsMetricTrendMock).toHaveBeenCalledWith(
                buyThroughRateQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                }),
                buyThroughRateQueryV2Factory({
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
