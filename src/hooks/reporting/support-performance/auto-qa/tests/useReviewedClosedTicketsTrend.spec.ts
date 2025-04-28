import moment from 'moment/moment'

import {
    fetchReviewedClosedTicketsTrend,
    useReviewedClosedTicketsTrend,
} from 'hooks/reporting/support-performance/auto-qa/useReviewedClosedTicketsTrend'
import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { reviewedClosedTicketsQueryFactory } from 'models/reporting/queryFactories/auto-qa/reviewedClosedTicketsQueryFactory'
import { ReportingQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { formatReportingQueryDate, getPreviousPeriod } from 'utils/reporting'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/reporting/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)
const fetchMetricTrendMock = assumeMock(fetchMetricTrend)

describe('ReviewedClosedTicketsTrend', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    useMetricTrendMock.mockImplementation(
        ((queryCreator: ReportingQuery) => queryCreator) as any,
    )

    describe('useReviewedClosedTicketsTrend', () => {
        it('should pass query factories with two periods', () => {
            renderHook(() =>
                useReviewedClosedTicketsTrend(statsFilters, timezone),
            )

            expect(useMetricTrendMock).toHaveBeenCalledWith(
                reviewedClosedTicketsQueryFactory(statsFilters, timezone),
                reviewedClosedTicketsQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                ),
            )
        })
    })

    describe('fetchReviewedClosedTicketsTrend', () => {
        it('should pass query factories with two periods', async () => {
            await fetchReviewedClosedTicketsTrend(statsFilters, timezone)

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                reviewedClosedTicketsQueryFactory(statsFilters, timezone),
                reviewedClosedTicketsQueryFactory(
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
