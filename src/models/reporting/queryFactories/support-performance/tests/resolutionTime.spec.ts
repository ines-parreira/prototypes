import moment from 'moment'
import {TicketChannel} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {
    TicketDimension,
    TicketMember,
    TicketSegment,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketMessagesMeasure,
    TicketMessagesMember,
    TicketMessagesSegment,
} from 'models/reporting/cubes/TicketMessagesCube'
import {resolutionTimeMetricPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/resolutionTime'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
} from 'utils/reporting'

describe('resolutionTimeMetricPerAgent', () => {
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
            resolutionTimeMetricPerAgentQueryFactory(statsFilters, timezone)
        ).toEqual({
            dimensions: [TicketDimension.AssigneeUserId],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
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
            measures: [TicketMessagesMeasure.ResolutionTime],
            segments: [
                TicketSegment.ClosedTickets,
                TicketMessagesSegment.ConversationStarted,
            ],
            timezone: timezone,
        })
    })
    it('should build a query with and agents sorting', () => {
        const agents = [2]

        expect(
            resolutionTimeMetricPerAgentQueryFactory(
                {...statsFilters, agents},
                timezone,
                sorting
            )
        ).toEqual({
            dimensions: [TicketDimension.AssigneeUserId],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
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
                    member: TicketMember.AssigneeUserId,
                    operator: ReportingFilterOperator.Equals,
                    values: agents.map(String),
                },
                {
                    member: TicketMember.Tags,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.tags?.map(String),
                },
            ],
            measures: [TicketMessagesMeasure.ResolutionTime],
            order: [[TicketMessagesMeasure.ResolutionTime, sorting]],
            segments: [
                TicketSegment.ClosedTickets,
                TicketMessagesSegment.ConversationStarted,
            ],
            timezone: timezone,
        })
    })
})
