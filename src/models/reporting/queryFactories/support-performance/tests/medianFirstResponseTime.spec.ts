import moment from 'moment'

import {TicketChannel} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {TicketDimension, TicketMember} from 'models/reporting/cubes/TicketCube'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
    TicketMessagesMember,
    TicketMessagesSegment,
} from 'models/reporting/cubes/TicketMessagesCube'
import {
    medianFirstResponseTimeMetricPerAgentQueryFactory,
    firstResponseTimeMetricPerTicketDrillDownQueryFactory,
    medianFirstResponseTimeQueryFactory,
} from 'models/reporting/queryFactories/support-performance/medianFirstResponseTime'
import {ReportingFilterOperator} from 'models/reporting/types'
import {LegacyStatsFilters} from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    TicketDrillDownFilter,
} from 'utils/reporting'

describe('medianFirstResponseTimeMetricPerAgent', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: LegacyStatsFilters = {
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
            medianFirstResponseTimeMetricPerAgentQueryFactory(
                statsFilters,
                timezone
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
            measures: [TicketMessagesMeasure.MedianFirstResponseTime],
            segments: [TicketMessagesSegment.ConversationStarted],
            timezone: timezone,
        })
    })

    it('should build a query with and agents sorting', () => {
        const agents = [2]

        expect(
            medianFirstResponseTimeMetricPerAgentQueryFactory(
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
            measures: [TicketMessagesMeasure.MedianFirstResponseTime],
            order: [[TicketMessagesMeasure.MedianFirstResponseTime, sorting]],
            segments: [TicketMessagesSegment.ConversationStarted],
            timezone: timezone,
        })
    })
})

describe('firstResponseTimeMetricPerTicketQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: LegacyStatsFilters = {
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
            firstResponseTimeMetricPerTicketDrillDownQueryFactory(
                statsFilters,
                timezone
            )
        ).toEqual({
            ...medianFirstResponseTimeQueryFactory(statsFilters, timezone),
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketMessagesDimension.FirstResponseTime,
                ...medianFirstResponseTimeMetricPerAgentQueryFactory(
                    statsFilters,
                    timezone
                ).dimensions,
            ],
            filters: [
                ...medianFirstResponseTimeMetricPerAgentQueryFactory(
                    statsFilters,
                    timezone
                ).filters,
                TicketDrillDownFilter,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
        })
    })

    it('should build a query with agents filter and sorting', () => {
        const agents = [2]
        const filters = {...statsFilters, agents}

        expect(
            firstResponseTimeMetricPerTicketDrillDownQueryFactory(
                filters,
                timezone,
                sorting
            )
        ).toEqual({
            ...medianFirstResponseTimeMetricPerAgentQueryFactory(
                filters,
                timezone
            ),
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketMessagesDimension.FirstResponseTime,
                ...medianFirstResponseTimeMetricPerAgentQueryFactory(
                    statsFilters,
                    timezone
                ).dimensions,
            ],
            filters: [
                ...medianFirstResponseTimeMetricPerAgentQueryFactory(
                    filters,
                    timezone
                ).filters,
                TicketDrillDownFilter,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [[TicketMessagesDimension.FirstResponseTime, sorting]],
        })
    })
})
