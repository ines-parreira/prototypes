import moment from 'moment'

import {
    fetchAverageScoreTrend,
    useAverageScoreTrend,
} from 'domains/reporting/hooks/quality-management/satisfaction/useAverageScoreTrend'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { averageScoreQueryFactory } from 'domains/reporting/models/queryFactories/satisfaction/averageScoreQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    formatReportingQueryDate,
    getPreviousPeriod,
} from 'domains/reporting/utils/reporting'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('domains/reporting/hooks/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)
const fetchMetricTrendMock = assumeMock(fetchMetricTrend)

describe('AverageScoreTrend', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    describe('useAverageScoreTrend', () => {
        it('should pass query factories with two periods', () => {
            renderHook(() => useAverageScoreTrend(statsFilters, timezone))

            expect(useMetricTrendMock).toHaveBeenCalledWith(
                averageScoreQueryFactory(statsFilters, timezone),
                averageScoreQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                ),
            )
        })
    })

    describe('fetchAverageScoreTrend', () => {
        it('should pass query factories with two periods', async () => {
            await fetchAverageScoreTrend(statsFilters, timezone)

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                averageScoreQueryFactory(statsFilters, timezone),
                averageScoreQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                ),
            )
        })
    })
})
