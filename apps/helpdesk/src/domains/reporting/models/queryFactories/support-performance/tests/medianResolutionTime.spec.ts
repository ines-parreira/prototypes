import moment from 'moment'

import { TicketChannel } from 'business/types/ticket'
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
import { CHANNEL_DIMENSION } from 'domains/reporting/models/queryFactories/support-performance/constants'
import {
    medianResolutionTimeMetricPerAgentQueryFactory,
    medianResolutionTimeMetricPerChannelQueryFactory,
    medianResolutionTimeQueryFactory,
    resolutionTimeMetricPerTicketDrillDownQueryFactory,
} from 'domains/reporting/models/queryFactories/support-performance/medianResolutionTime'
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

describe('medianResolutionTimeMetricPerAgent', () => {
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
            medianResolutionTimeMetricPerAgentQueryFactory(
                statsFilters,
                timezone,
            ),
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
                    values: statsFilters.integrations?.values.map(String),
                },
                {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.channels?.values,
                },
                {
                    member: TicketMember.Tags,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.tags?.[0]?.values.map(String),
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
                { ...statsFilters, agents: withDefaultLogicalOperator(agents) },
                timezone,
                sorting,
            ),
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
                    values: statsFilters.integrations?.values.map(String),
                },
                {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.channels?.values,
                },
                {
                    member: TicketMember.AssigneeUserId,
                    operator: ReportingFilterOperator.Equals,
                    values: agents.map(String),
                },
                {
                    member: TicketMember.Tags,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.tags?.[0]?.values.map(String),
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

describe('medianResolutionTimeMetricPerChannelQueryFactory', () => {
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
            medianResolutionTimeMetricPerChannelQueryFactory(
                statsFilters,
                timezone,
            ),
        ).toEqual({
            dimensions: [CHANNEL_DIMENSION],
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
                    values: statsFilters.integrations?.values.map(String),
                },
                {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.channels?.values,
                },
                {
                    member: TicketMember.Tags,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.tags?.[0]?.values.map(String),
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
            medianResolutionTimeMetricPerChannelQueryFactory(
                { ...statsFilters, agents: withDefaultLogicalOperator(agents) },
                timezone,
                sorting,
            ),
        ).toEqual({
            dimensions: [CHANNEL_DIMENSION],
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
                    values: statsFilters.integrations?.values.map(String),
                },
                {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.channels?.values,
                },
                {
                    member: TicketMember.AssigneeUserId,
                    operator: ReportingFilterOperator.Equals,
                    values: agents.map(String),
                },
                {
                    member: TicketMember.Tags,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.tags?.[0]?.values.map(String),
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
            resolutionTimeMetricPerTicketDrillDownQueryFactory(
                statsFilters,
                timezone,
            ),
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
        const filters = {
            ...statsFilters,
            agents: withDefaultLogicalOperator(agents),
        }

        expect(
            resolutionTimeMetricPerTicketDrillDownQueryFactory(
                filters,
                timezone,
                sorting,
            ),
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
