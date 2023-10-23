import moment from 'moment'
import {TicketChannel} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {TicketMember} from 'models/reporting/cubes/TicketCube'
import {
    TicketMessagesMeasure,
    TicketMessagesMember,
    TicketMessagesSegment,
} from 'models/reporting/cubes/TicketMessagesCube'
import {firstResponseTimeMetricPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/firstResponseTime'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
} from 'utils/reporting'

describe('firstResponseTimeMetricPerAgent', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
        channels: [TicketChannel.Email, TicketChannel.Chat],
        integrations: [1],
        tags: [1, 2],
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc

    it('should build a query', () => {
        expect(
            firstResponseTimeMetricPerAgentQueryFactory(statsFilters, timezone)
        ).toEqual({
            dimensions: [TicketMessagesMember.FirstHelpdeskMessageUserId],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                {
                    member: TicketMessagesMember.FirstHelpdeskMessageDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [
                        formatReportingQueryDate(periodStart),
                        formatReportingQueryDate(periodEnd),
                    ],
                },
                {
                    member: TicketMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [formatReportingQueryDate(periodStart)],
                },
                {
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [formatReportingQueryDate(periodEnd)],
                },
                {
                    member: TicketMessagesMember.Integration,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.integrations?.map(String),
                },
                {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.channels,
                },
                {
                    member: TicketMember.Tags,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.tags?.map(String),
                },
            ],
            measures: [TicketMessagesMeasure.FirstResponseTime],
            segments: [TicketMessagesSegment.ConversationStarted],
            timezone: timezone,
        })
    })

    it('should build a query with and agents sorting', () => {
        const agents = [2]

        expect(
            firstResponseTimeMetricPerAgentQueryFactory(
                {...statsFilters, agents},
                timezone,
                sorting
            )
        ).toEqual({
            dimensions: [TicketMessagesMember.FirstHelpdeskMessageUserId],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                {
                    member: TicketMessagesMember.FirstHelpdeskMessageDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [
                        formatReportingQueryDate(periodStart),
                        formatReportingQueryDate(periodEnd),
                    ],
                },
                {
                    member: TicketMessagesMember.FirstHelpdeskMessageUserId,
                    operator: ReportingFilterOperator.Equals,
                    values: agents?.map(String),
                },
                {
                    member: TicketMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [formatReportingQueryDate(periodStart)],
                },
                {
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [formatReportingQueryDate(periodEnd)],
                },
                {
                    member: TicketMessagesMember.Integration,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.integrations?.map(String),
                },
                {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.channels,
                },
                {
                    member: TicketMember.Tags,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.tags?.map(String),
                },
            ],
            measures: [TicketMessagesMeasure.FirstResponseTime],
            order: [[TicketMessagesMeasure.FirstResponseTime, sorting]],
            segments: [TicketMessagesSegment.ConversationStarted],
            timezone: timezone,
        })
    })
})
