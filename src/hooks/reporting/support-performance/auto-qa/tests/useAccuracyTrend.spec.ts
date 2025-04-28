import moment from 'moment'

import {
    fetchAccuracyTrend,
    useAccuracyTrend,
} from 'hooks/reporting/support-performance/auto-qa/useAccuracyTrend'
import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { accuracyQueryFactory } from 'models/reporting/queryFactories/auto-qa/accuracyQueryFactory'
import { StatsFilters } from 'models/stat/types'
import { formatReportingQueryDate, getPreviousPeriod } from 'utils/reporting'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/reporting/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)
const fetchMetricTrendMock = assumeMock(fetchMetricTrend)

describe('AccuracyTrend', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    describe('useAccuracyTrend', () => {
        it('should pass query factories with two periods', () => {
            renderHook(() => useAccuracyTrend(statsFilters, timezone))

            expect(useMetricTrendMock).toHaveBeenCalledWith(
                accuracyQueryFactory(statsFilters, timezone),
                accuracyQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                ),
            )
        })
    })

    describe('fetchAccuracyTrend', () => {
        it('should pass query factories with two periods', async () => {
            await fetchAccuracyTrend(statsFilters, timezone)

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                accuracyQueryFactory(statsFilters, timezone),
                accuracyQueryFactory(
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
