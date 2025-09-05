import moment from 'moment'

import { TicketChannel } from 'business/types/ticket'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    TicketDimension,
    TicketMeasure,
    TicketMember,
    TicketSegment,
} from 'domains/reporting/models/cubes/TicketCube'
import { TicketMessagesMember } from 'domains/reporting/models/cubes/TicketMessagesCube'
import {
    closedTicketsPerAgentQueryFactory,
    closedTicketsPerChannelQueryFactory,
    closedTicketsPerTicketDrillDownQueryFactory,
} from 'domains/reporting/models/queryFactories/support-performance/closedTickets'
import { CHANNEL_DIMENSION } from 'domains/reporting/models/queryFactories/support-performance/constants'
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

describe('closedTickets', () => {
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

    describe('closedTicketsMetricPerAgent', () => {
        it('should build a query', () => {
            expect(
                closedTicketsPerAgentQueryFactory(statsFilters, timezone),
            ).toEqual({
                metricName:
                    METRIC_NAMES.SUPPORT_PERFORMANCE_CLOSED_TICKETS_PER_AGENT,
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
                measures: [TicketMeasure.TicketCount],
                segments: [TicketSegment.ClosedTickets],
                timezone: timezone,
            })
        })

        it('should build a query with and agents sorting', () => {
            const agents = [2]

            expect(
                closedTicketsPerAgentQueryFactory(
                    {
                        ...statsFilters,
                        agents: withDefaultLogicalOperator(agents),
                    },
                    timezone,
                    sorting,
                ),
            ).toEqual({
                metricName:
                    METRIC_NAMES.SUPPORT_PERFORMANCE_CLOSED_TICKETS_PER_AGENT,
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
                        values: agents?.map(String),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.[0]?.values.map(String),
                    },
                ],
                measures: [TicketMeasure.TicketCount],
                order: [[TicketMeasure.TicketCount, sorting]],
                segments: [TicketSegment.ClosedTickets],
                timezone: timezone,
            })
        })
    })

    describe('closedTicketsPerChannelQueryFactory', () => {
        it('should build a query', () => {
            expect(
                closedTicketsPerChannelQueryFactory(statsFilters, timezone),
            ).toEqual({
                metricName:
                    METRIC_NAMES.SUPPORT_PERFORMANCE_CLOSED_TICKETS_PER_CHANNEL,
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
                measures: [TicketMeasure.TicketCount],
                segments: [TicketSegment.ClosedTickets],
                timezone: timezone,
            })
        })

        it('should build a query with and agents sorting', () => {
            const agents = [2]

            expect(
                closedTicketsPerChannelQueryFactory(
                    {
                        ...statsFilters,
                        agents: withDefaultLogicalOperator(agents),
                    },
                    timezone,
                    sorting,
                ),
            ).toEqual({
                metricName:
                    METRIC_NAMES.SUPPORT_PERFORMANCE_CLOSED_TICKETS_PER_CHANNEL,
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
                        values: agents?.map(String),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.[0]?.values.map(String),
                    },
                ],
                measures: [TicketMeasure.TicketCount],
                order: [[TicketMeasure.TicketCount, sorting]],
                segments: [TicketSegment.ClosedTickets],
                timezone: timezone,
            })
        })
    })

    describe('closedTicketsPerTicketQueryFactory', () => {
        it('should build a query', () => {
            expect(
                closedTicketsPerTicketDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                ),
            ).toEqual({
                ...closedTicketsPerAgentQueryFactory(statsFilters, timezone),
                metricName:
                    METRIC_NAMES.SUPPORT_PERFORMANCE_CLOSED_TICKETS_PER_TICKET_DRILL_DOWN,
                measures: [],
                dimensions: [
                    TicketDimension.TicketId,
                    TicketDimension.CreatedDatetime,
                    ...closedTicketsPerAgentQueryFactory(statsFilters, timezone)
                        .dimensions,
                ],
                filters: [
                    ...closedTicketsPerAgentQueryFactory(statsFilters, timezone)
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
                closedTicketsPerTicketDrillDownQueryFactory(
                    filters,
                    timezone,
                    sorting,
                ),
            ).toEqual({
                ...closedTicketsPerAgentQueryFactory(filters, timezone),
                metricName:
                    METRIC_NAMES.SUPPORT_PERFORMANCE_CLOSED_TICKETS_PER_TICKET_DRILL_DOWN,
                measures: [],
                dimensions: [
                    TicketDimension.TicketId,
                    TicketDimension.CreatedDatetime,
                    ...closedTicketsPerAgentQueryFactory(statsFilters, timezone)
                        .dimensions,
                ],
                filters: [
                    ...closedTicketsPerAgentQueryFactory(filters, timezone)
                        .filters,
                    TicketDrillDownFilter,
                ],
                limit: DRILLDOWN_QUERY_LIMIT,
                order: [[TicketDimension.CreatedDatetime, sorting]],
            })
        })
    })
})
