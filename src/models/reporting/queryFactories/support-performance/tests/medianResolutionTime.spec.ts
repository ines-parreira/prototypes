import moment from 'moment'
import {TicketChannel} from 'business/types/ticket'
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
    medianResolutionTimeMetricPerAgentQueryFactory,
    resolutionTimeMetricPerTicketDrillDownQueryFactory,
    medianResolutionTimeQueryFactory,
} from 'models/reporting/queryFactories/support-performance/medianResolutionTime'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    TicketDrillDownFilter,
} from 'utils/reporting'

describe('medianResolutionTimeMetricPerAgent', () => {
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
            medianResolutionTimeMetricPerAgentQueryFactory(
                statsFilters,
                timezone
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
                    member: TicketMember.Tags,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.tags?.map(String),
                },
            ],
            measures: [TicketMessagesMeasure.MedianResolutionTime],
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
            medianResolutionTimeMetricPerAgentQueryFactory(
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
            measures: [TicketMessagesMeasure.MedianResolutionTime],
            order: [[TicketMessagesMeasure.MedianResolutionTime, sorting]],
            segments: [
                TicketSegment.ClosedTickets,
                TicketMessagesSegment.ConversationStarted,
            ],
            timezone: timezone,
        })
    })
})

describe('resolutionTimeMetricPerTicketQueryFactory', () => {
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
            resolutionTimeMetricPerTicketDrillDownQueryFactory(
                statsFilters,
                timezone
            )
        ).toEqual({
            ...medianResolutionTimeQueryFactory(statsFilters, timezone),
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketMessagesDimension.ResolutionTime,
            ],
            filters: [
                ...medianResolutionTimeQueryFactory(statsFilters, timezone)
                    .filters,
                TicketDrillDownFilter,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
        })
    })

    it('should build a query with agents filter and sorting', () => {
        const agents = [2]
        const filters = {...statsFilters, agents}

        expect(
            resolutionTimeMetricPerTicketDrillDownQueryFactory(
                filters,
                timezone,
                sorting
            )
        ).toEqual({
            ...medianResolutionTimeQueryFactory(filters, timezone),
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketMessagesDimension.ResolutionTime,
            ],
            filters: [
                ...medianResolutionTimeQueryFactory(filters, timezone).filters,
                TicketDrillDownFilter,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [[TicketMessagesDimension.ResolutionTime, sorting]],
        })
    })
})
