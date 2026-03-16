import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchCoverageRateTrend,
    useCoverageRateTrend,
} from 'domains/reporting/hooks/automate/useCoverageRateTrend'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { coverageRateQueryV2Factory } from 'domains/reporting/models/scopes/aiAgentCoverageRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useStatsMetricTrend')

const fetchStatsMetricTrendMock = assumeMock(fetchStatsMetricTrend)
const useStatsMetricTrendMock = assumeMock(useStatsMetricTrend)

describe('CoverageRateTrend', () => {
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

    describe('useCoverageRateTrend', () => {
        it('should return the result of useStatsMetricTrend', () => {
            const { result } = renderHook(() =>
                useCoverageRateTrend(statsFilters, timezone),
            )

            expect(result.current).toEqual(trendData)
        })

        it('should pass current and previous period query factories to useStatsMetricTrend', () => {
            renderHook(() => useCoverageRateTrend(statsFilters, timezone))

            expect(useStatsMetricTrendMock).toHaveBeenCalledWith(
                coverageRateQueryV2Factory({ filters: statsFilters, timezone }),
                coverageRateQueryV2Factory({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                }),
            )
        })
    })

    describe('fetchCoverageRateTrend', () => {
        it('should return the result of fetchStatsMetricTrend', async () => {
            const result = await fetchCoverageRateTrend(statsFilters, timezone)

            expect(result).toEqual(trendData)
        })

        it('should pass current and previous period query factories to fetchStatsMetricTrend', async () => {
            await fetchCoverageRateTrend(statsFilters, timezone)

            expect(fetchStatsMetricTrendMock).toHaveBeenCalledWith(
                coverageRateQueryV2Factory({ filters: statsFilters, timezone }),
                coverageRateQueryV2Factory({
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
