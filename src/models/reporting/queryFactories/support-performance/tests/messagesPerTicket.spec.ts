import moment from 'moment/moment'
import {OrderDirection} from 'models/api/types'
import {HelpdeskMessageMember} from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMember,
    TicketSegment,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
    TicketMessagesSegment,
} from 'models/reporting/cubes/TicketMessagesCube'
import {
    messagesPerTicketDrillDownQueryFactory,
    messagesPerTicketQueryFactory,
} from 'models/reporting/queryFactories/support-performance/messagesPerTicket'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    PublicHelpdeskAndApiMessagesFilter,
    TicketDrillDownFilter,
} from 'utils/reporting'

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

        expect(query).toEqual({
            measures: [TicketMessagesMeasure.MessagesAverage],
            dimensions: [],
            filters: [
                {
                    member: HelpdeskMessageMember.SentDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [periodStart, periodEnd],
                },
                ...PublicHelpdeskAndApiMessagesFilter,
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
