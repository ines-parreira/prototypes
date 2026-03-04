import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { ticketsCreatedQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsCreated'
import { createdTicketsCountQueryV2Factory } from 'domains/reporting/models/scopes/ticketsCreated'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    formatReportingQueryDate,
    getPreviousPeriod,
} from 'domains/reporting/utils/reporting'
import {
    fetchAllTickets,
    useAllTickets,
} from 'pages/aiAgent/Overview/hooks/kpis/useAllTickets'

jest.mock('domains/reporting/hooks/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)
const fetchMetricTrendMock = assumeMock(fetchMetricTrend)

describe('useAllTickets', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'UTC'

    it('should pass query factories with two periods', () => {
        renderHook(() => useAllTickets(statsFilters, timezone))

        expect(useMetricTrendMock).toHaveBeenCalledWith(
            ticketsCreatedQueryFactory(statsFilters, timezone),
            ticketsCreatedQueryFactory(
                {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone,
            ),
            createdTicketsCountQueryV2Factory({
                filters: statsFilters,
                timezone,
            }),
            createdTicketsCountQueryV2Factory({
                filters: {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone,
            }),
        )
    })
})

describe('fetchAllTickets', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'UTC'

    it('should pass query factories with two periods', async () => {
        fetchMetricTrendMock.mockResolvedValue({
            data: { value: 100, prevValue: 50 },
            isFetching: false,
            isError: false,
        })

        await fetchAllTickets(statsFilters, timezone)

        expect(fetchMetricTrendMock).toHaveBeenCalledWith(
            ticketsCreatedQueryFactory(statsFilters, timezone),
            ticketsCreatedQueryFactory(
                {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone,
            ),
            createdTicketsCountQueryV2Factory({
                filters: statsFilters,
                timezone,
            }),
            createdTicketsCountQueryV2Factory({
                filters: {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone,
            }),
        )
    })
})
