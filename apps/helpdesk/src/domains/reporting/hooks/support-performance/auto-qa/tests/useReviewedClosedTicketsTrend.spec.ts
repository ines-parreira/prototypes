import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment/moment'

import {
    fetchReviewedClosedTicketsTrend,
    useReviewedClosedTicketsTrend,
} from 'domains/reporting/hooks/support-performance/auto-qa/useReviewedClosedTicketsTrend'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { reviewedClosedTicketsQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/reviewedClosedTicketsQueryFactory'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import {
    formatReportingQueryDate,
    getPreviousPeriod,
} from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricTrend')
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
