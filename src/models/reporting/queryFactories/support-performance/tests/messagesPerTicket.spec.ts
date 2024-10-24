import moment from 'moment/moment'

import {OrderDirection} from 'models/api/types'
import {
    TicketDimension,
    TicketMember,
    TicketSegment,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
    TicketMessagesMember,
    TicketMessagesSegment,
} from 'models/reporting/cubes/TicketMessagesCube'
import {
    messagesPerTicketDrillDownQueryFactory,
    messagesPerTicketQueryFactory,
} from 'models/reporting/queryFactories/support-performance/messagesPerTicket'
import {ReportingFilterOperator} from 'models/reporting/types'
import {LegacyStatsFilters} from 'models/stat/types'
import {subtractDaysFromDate} from 'utils/date'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    TicketDrillDownFilter,
} from 'utils/reporting'

describe('messagesPerTicketQueryFactory', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: LegacyStatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    it('should create a query', () => {
        const query = messagesPerTicketQueryFactory(statsFilters, timezone)

        const hardPeriodStart = formatReportingQueryDate(
            subtractDaysFromDate(periodStart, 180)
        )

        expect(query).toEqual({
            measures: [TicketMessagesMeasure.MessagesAverage],
            dimensions: [],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                {
                    member: TicketMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
                {
                    member: TicketMessagesMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [hardPeriodStart],
                },
                {
                    member: TicketMember.CreatedDatetime,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [hardPeriodStart],
                },
            ],
            timezone,
            segments: [
                TicketSegment.ClosedTickets,
                TicketMessagesSegment.ConversationStarted,
            ],
        })
    })
})

describe('messagesPerTicketDrillDownQueryFactory', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: LegacyStatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc

    it('should create a query', () => {
        const query = messagesPerTicketDrillDownQueryFactory(
            statsFilters,
            timezone
        )

        expect(query).toEqual({
            ...messagesPerTicketQueryFactory(statsFilters, timezone),
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketMessagesDimension.MessagesCount,
                ...messagesPerTicketQueryFactory(statsFilters, timezone)
                    .dimensions,
            ],
            filters: [
                ...messagesPerTicketQueryFactory(statsFilters, timezone)
                    .filters,
                TicketDrillDownFilter,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
        })
    })

    it('should create a query with sorting', () => {
        const query = messagesPerTicketDrillDownQueryFactory(
            statsFilters,
            timezone,
            sorting
        )

        expect(query).toEqual({
            ...messagesPerTicketQueryFactory(statsFilters, timezone),
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketMessagesDimension.MessagesCount,
                ...messagesPerTicketQueryFactory(statsFilters, timezone)
                    .dimensions,
            ],
            filters: [
                ...messagesPerTicketQueryFactory(statsFilters, timezone)
                    .filters,
                TicketDrillDownFilter,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [[TicketMessagesDimension.MessagesCount, sorting]],
        })
    })
})
