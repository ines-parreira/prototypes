import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import {
    fetchSatisfactionScoreTrend,
    useSatisfactionScoreTrend,
} from 'domains/reporting/hooks/quality-management/satisfaction/useSatisfactionScoreTrend'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { satisfactionScoreQueryFactory } from 'domains/reporting/models/queryFactories/satisfaction/satisfactionScoreQueryFactory'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    formatReportingQueryDate,
    getPreviousPeriod,
} from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricTrend')
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
