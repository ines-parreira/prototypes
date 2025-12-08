import moment from 'moment/moment'

import { TicketChannel } from 'business/types/ticket'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    HandleTimeDimension,
    HandleTimeMeasure,
} from 'domains/reporting/models/cubes/agentxp/HandleTimeCube'
import {
    TicketDimension,
    TicketMember,
    TicketSegment,
} from 'domains/reporting/models/cubes/TicketCube'
import { TicketMessagesMember } from 'domains/reporting/models/cubes/TicketMessagesCube'
import {
    ticketAverageHandleTimePerAgentQueryFactory,
    ticketAverageHandleTimeQueryFactory,
    ticketHandleTimePerTicketDrillDownQueryFactory,
} from 'domains/reporting/models/queryFactories/agentxp/ticketHandleTime'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { TagFilterInstanceId } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

describe('ticketHandleTime', () => {
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
        agents: withDefaultLogicalOperator([1]),
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc

    describe('ticketHandleTimeQueryFactory', () => {
        it('should build the query', () => {
            expect(
                ticketAverageHandleTimeQueryFactory(statsFilters, timezone),
            ).toEqual({
                metricName: METRIC_NAMES.AGENTXP_TICKET_AVERAGE_HANDLE_TIME,
                dimensions: [],
                filters: [
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
                        values: statsFilters.agents?.values.map(String),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.[0].values.map(String),
                    },
                ],
                measures: [HandleTimeMeasure.AverageHandleTime],
                segments: [TicketSegment.ClosedTickets],
                timezone: timezone,
            })
        })

        it('should build the query with sorting', () => {
            expect(
                ticketAverageHandleTimeQueryFactory(
                    statsFilters,
                    timezone,
                    sorting,
                ),
            ).toEqual({
                metricName: METRIC_NAMES.AGENTXP_TICKET_AVERAGE_HANDLE_TIME,
                dimensions: [],
                filters: [
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
                        values: statsFilters.agents?.values.map(String),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.[0].values.map(String),
                    },
                ],
                measures: [HandleTimeMeasure.AverageHandleTime],
                order: [[HandleTimeMeasure.AverageHandleTime, sorting]],
                segments: [TicketSegment.ClosedTickets],
                timezone: timezone,
            })
        })
    })

    describe('ticketHandleTimePerTicketDrillDownQueryFactory', () => {
        it('should build the query', () => {
            expect(
                ticketHandleTimePerTicketDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                ),
            ).toEqual({
                metricName:
                    METRIC_NAMES.AGENTXP_TICKET_HANDLE_TIME_PER_TICKET_DRILL_DOWN,
                dimensions: [
                    TicketDimension.TicketId,
                    HandleTimeDimension.TicketHandleTime,
                ],
                filters: [
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
                        member: TicketMember.AssigneeUserId,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.agents?.values.map(String),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.[0].values.map(String),
                    },
                ],
                limit: DRILLDOWN_QUERY_LIMIT,
                measures: [],
                segments: [TicketSegment.ClosedTickets],
                timezone: timezone,
            })
        })

        it('should build the query with sorting', () => {
            expect(
                ticketHandleTimePerTicketDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    sorting,
                ),
            ).toEqual({
                metricName:
                    METRIC_NAMES.AGENTXP_TICKET_HANDLE_TIME_PER_TICKET_DRILL_DOWN,
                dimensions: [
                    TicketDimension.TicketId,
                    HandleTimeDimension.TicketHandleTime,
                ],
                filters: [
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
                        member: TicketMember.AssigneeUserId,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.agents?.values.map(String),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.[0].values.map(String),
                    },
                ],
                limit: DRILLDOWN_QUERY_LIMIT,
                measures: [],
                order: [[HandleTimeDimension.TicketHandleTime, sorting]],
                segments: [TicketSegment.ClosedTickets],
                timezone: timezone,
            })
        })
    })

    describe('ticketAverageHandleTimePerAgentQueryFactory', () => {
        it('should build the query', () => {
            expect(
                ticketAverageHandleTimePerAgentQueryFactory(
                    statsFilters,
                    timezone,
                ),
            ).toEqual({
                metricName:
                    METRIC_NAMES.AGENTXP_TICKET_AVERAGE_HANDLE_TIME_PER_AGENT,
                dimensions: [TicketDimension.AssigneeUserId],
                filters: [
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
                        member: TicketMember.AssigneeUserId,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.agents?.values.map(String),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.[0].values.map(String),
                    },
                ],
                limit: DRILLDOWN_QUERY_LIMIT,
                measures: [HandleTimeMeasure.AverageHandleTime],
                segments: [TicketSegment.ClosedTickets],
                timezone: timezone,
            })
        })

        it('should build the query with sorting', () => {
            expect(
                ticketAverageHandleTimePerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    sorting,
                ),
            ).toEqual({
                metricName:
                    METRIC_NAMES.AGENTXP_TICKET_AVERAGE_HANDLE_TIME_PER_AGENT,
                dimensions: [TicketDimension.AssigneeUserId],
                filters: [
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
                        member: TicketMember.AssigneeUserId,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.agents?.values.map(String),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.[0].values.map(String),
                    },
                ],
                limit: DRILLDOWN_QUERY_LIMIT,
                measures: [HandleTimeMeasure.AverageHandleTime],
                order: [[HandleTimeMeasure.AverageHandleTime, sorting]],
                segments: [TicketSegment.ClosedTickets],
                timezone: timezone,
            })
        })
    })
})
