import moment from 'moment'

import { TicketChannel } from 'business/types/ticket'
import {
    TicketDimension,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
    TicketMessagesMember,
    TicketMessagesSegment,
} from 'domains/reporting/models/cubes/TicketMessagesCube'
import {
    firstResponseTimeMetricPerTicketDrillDownQueryFactory,
    medianFirstResponseTimeMetricPerAgentQueryFactory,
    medianFirstResponseTimeQueryFactory,
} from 'domains/reporting/models/queryFactories/support-performance/medianFirstResponseTime'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import {
    StatsFilters,
    TagFilterInstanceId,
} from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    TicketDrillDownFilter,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

describe('medianFirstResponseTimeMetricPerAgent', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
        channels: withDefaultLogicalOperator([
            TicketChannel.Email,
            TicketChannel.Chat,
        ]),
        integrations: withDefaultLogicalOperator([1]),
        tags: [
            {
                ...withDefaultLogicalOperator([1, 2]),
                filterInstanceId: TagFilterInstanceId.First,
            },
        ],
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc

    it('should build a query', () => {
        expect(
            medianFirstResponseTimeMetricPerAgentQueryFactory(
                statsFilters,
                timezone,
            ),
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
                    values: statsFilters.integrations?.values.map(String),
                },
                {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.channels?.values.map(String),
                },
                {
                    member: TicketMember.Tags,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.tags?.[0]?.values.map(String),
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
                { ...statsFilters, agents: withDefaultLogicalOperator(agents) },
                timezone,
                sorting,
            ),
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
                    values: statsFilters.integrations?.values.map(String),
                },
                {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.channels?.values,
                },
                {
                    member: TicketMessagesMember.FirstHelpdeskMessageUserId,
                    operator: ReportingFilterOperator.Equals,
                    values: agents?.map(String),
                },
                {
                    member: TicketMember.Tags,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.tags?.[0]?.values.map(String),
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
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
        channels: withDefaultLogicalOperator([
            TicketChannel.Email,
            TicketChannel.Chat,
        ]),
        integrations: withDefaultLogicalOperator([1]),
        tags: [
            {
                ...withDefaultLogicalOperator([1, 2]),
                filterInstanceId: TagFilterInstanceId.First,
            },
        ],
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc

    it('should build a query', () => {
        expect(
            firstResponseTimeMetricPerTicketDrillDownQueryFactory(
                statsFilters,
                timezone,
            ),
        ).toEqual({
            ...medianFirstResponseTimeQueryFactory(statsFilters, timezone),
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketMessagesDimension.FirstResponseTime,
                ...medianFirstResponseTimeMetricPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                ).dimensions,
            ],
            filters: [
                ...medianFirstResponseTimeMetricPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                ).filters,
                TicketDrillDownFilter,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
        })
    })

    it('should build a query with agents filter and sorting', () => {
        const agents = [2]
        const filters = {
            ...statsFilters,
            agents: withDefaultLogicalOperator(agents),
        }

        expect(
            firstResponseTimeMetricPerTicketDrillDownQueryFactory(
                filters,
                timezone,
                sorting,
            ),
        ).toEqual({
            ...medianFirstResponseTimeMetricPerAgentQueryFactory(
                filters,
                timezone,
            ),
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketMessagesDimension.FirstResponseTime,
                ...medianFirstResponseTimeMetricPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                ).dimensions,
            ],
            filters: [
                ...medianFirstResponseTimeMetricPerAgentQueryFactory(
                    filters,
                    timezone,
                ).filters,
                TicketDrillDownFilter,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [[TicketMessagesDimension.FirstResponseTime, sorting]],
        })
    })
})
