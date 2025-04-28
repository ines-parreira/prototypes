import moment from 'moment'

import {
    fetchSatisfactionScoreTrend,
    useSatisfactionScoreTrend,
} from 'hooks/reporting/quality-management/satisfaction/useSatisfactionScoreTrend'
import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { satisfactionScoreQueryFactory } from 'models/reporting/queryFactories/satisfaction/satisfactionScoreQueryFactory'
import { StatsFilters } from 'models/stat/types'
import { formatReportingQueryDate, getPreviousPeriod } from 'utils/reporting'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/reporting/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)
const fetchMetricTrendMock = assumeMock(fetchMetricTrend)

describe('useSatisfactionScoreTrend', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    describe('useSatisfactionScoreTrend', () => {
        it('should pass query factories with two periods', () => {
            renderHook(() => useSatisfactionScoreTrend(statsFilters, timezone))

            expect(useMetricTrendMock).toHaveBeenCalledWith(
                satisfactionScoreQueryFactory(statsFilters, timezone),
                satisfactionScoreQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                ),
            )
        })
    })

    describe('fetchSatisfactionScoreTrend', () => {
        it('should pass query factories with two periods', async () => {
            await fetchSatisfactionScoreTrend(statsFilters, timezone)

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                satisfactionScoreQueryFactory(statsFilters, timezone),
                satisfactionScoreQueryFactory(
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
