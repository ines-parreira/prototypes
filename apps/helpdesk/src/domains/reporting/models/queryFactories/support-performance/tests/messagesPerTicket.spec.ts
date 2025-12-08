import moment from 'moment/moment'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    TicketDimension,
    TicketMember,
    TicketSegment,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
    TicketMessagesMember,
    TicketMessagesSegment,
} from 'domains/reporting/models/cubes/TicketMessagesCube'
import {
    messagesPerTicketDrillDownQueryFactory,
    messagesPerTicketQueryFactory,
} from 'domains/reporting/models/queryFactories/support-performance/messagesPerTicket'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'
import { subtractDaysFromDate } from 'utils/date'

describe('messagesPerTicketQueryFactory', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    it('should create a query', () => {
        const query = messagesPerTicketQueryFactory(statsFilters, timezone)

        const hardPeriodStart = formatReportingQueryDate(
            subtractDaysFromDate(periodStart, 180),
        )

        expect(query).toEqual({
            metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_PER_TICKET,
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
    const statsFilters: StatsFilters = {
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
            timezone,
        )

        expect(query).toEqual({
            ...messagesPerTicketQueryFactory(statsFilters, timezone),
            metricName:
                METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_PER_TICKET_DRILL_DOWN,
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketMessagesDimension.MessagesCount,
                ...messagesPerTicketQueryFactory(statsFilters, timezone)
                    .dimensions,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
        })
    })

    it('should create a query with sorting', () => {
        const query = messagesPerTicketDrillDownQueryFactory(
            statsFilters,
            timezone,
            sorting,
        )

        expect(query).toEqual({
            ...messagesPerTicketQueryFactory(statsFilters, timezone),
            metricName:
                METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_PER_TICKET_DRILL_DOWN,
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketMessagesDimension.MessagesCount,
                ...messagesPerTicketQueryFactory(statsFilters, timezone)
                    .dimensions,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [[TicketMessagesDimension.MessagesCount, sorting]],
        })
    })
})
