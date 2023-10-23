import moment from 'moment/moment'
import {HelpdeskMessageMember} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketMember, TicketSegment} from 'models/reporting/cubes/TicketCube'
import {
    TicketMessagesMeasure,
    TicketMessagesSegment,
} from 'models/reporting/cubes/TicketMessagesCube'
import {messagesPerTicketQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesPerTicket'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    PublicHelpdeskAndApiMessagesFilter,
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
