import moment from 'moment/moment'

import { TicketChannel } from 'business/types/ticket'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    AgentTimeTrackingDimension,
    AgentTimeTrackingMeasure,
    AgentTimeTrackingMember,
} from 'domains/reporting/models/cubes/agentxp/AgentTimeTrackingCube'
import {
    onlineTimePerAgentQueryFactory,
    onlineTimeQueryFactory,
} from 'domains/reporting/models/queryFactories/agentxp/onlineTime'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { TagFilterInstanceId } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

describe('onlineTimePerAgentQueryFactory', () => {
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

    describe('onlineTimeQueryFactory', () => {
        it('should build the query', () => {
            expect(onlineTimeQueryFactory(statsFilters, timezone)).toEqual({
                metricName: METRIC_NAMES.AGENTXP_ONLINE_TIME,
                dimensions: [],
                filters: [
                    {
                        member: AgentTimeTrackingMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [formatReportingQueryDate(periodStart)],
                    },
                    {
                        member: AgentTimeTrackingMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [formatReportingQueryDate(periodEnd)],
                    },
                    {
                        member: AgentTimeTrackingMember.UserId,
                        operator: ReportingFilterOperator.Equals,
                        values: [String(statsFilters.agents?.values)],
                    },
                ],
                measures: [AgentTimeTrackingMeasure.OnlineTime],
                timezone: timezone,
            })
        })

        it('should build the query with sorting', () => {
            expect(
                onlineTimeQueryFactory(statsFilters, timezone, sorting),
            ).toEqual({
                metricName: METRIC_NAMES.AGENTXP_ONLINE_TIME,
                dimensions: [],
                filters: [
                    {
                        member: AgentTimeTrackingMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [formatReportingQueryDate(periodStart)],
                    },
                    {
                        member: AgentTimeTrackingMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [formatReportingQueryDate(periodEnd)],
                    },
                    {
                        member: AgentTimeTrackingMember.UserId,
                        operator: ReportingFilterOperator.Equals,
                        values: [String(statsFilters.agents?.values)],
                    },
                ],
                measures: [AgentTimeTrackingMeasure.OnlineTime],
                order: [[AgentTimeTrackingMeasure.OnlineTime, sorting]],
                timezone: timezone,
            })
        })
    })

    describe('onlineTimePerAgentQueryFactory', () => {
        it('should build the query', () => {
            expect(
                onlineTimePerAgentQueryFactory(statsFilters, timezone),
            ).toEqual({
                metricName: METRIC_NAMES.AGENTXP_ONLINE_TIME_PER_AGENT,
                dimensions: [AgentTimeTrackingDimension.UserId],
                filters: [
                    {
                        member: AgentTimeTrackingMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [formatReportingQueryDate(periodStart)],
                    },
                    {
                        member: AgentTimeTrackingMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [formatReportingQueryDate(periodEnd)],
                    },
                    {
                        member: AgentTimeTrackingMember.UserId,
                        operator: ReportingFilterOperator.Equals,
                        values: [String(statsFilters.agents?.values)],
                    },
                ],
                measures: [AgentTimeTrackingMeasure.OnlineTime],
                timezone: timezone,
            })
        })

        it('should build the query with sorting', () => {
            expect(
                onlineTimePerAgentQueryFactory(statsFilters, timezone, sorting),
            ).toEqual({
                metricName: METRIC_NAMES.AGENTXP_ONLINE_TIME_PER_AGENT,
                dimensions: [AgentTimeTrackingDimension.UserId],
                filters: [
                    {
                        member: AgentTimeTrackingMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [formatReportingQueryDate(periodStart)],
                    },
                    {
                        member: AgentTimeTrackingMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [formatReportingQueryDate(periodEnd)],
                    },
                    {
                        member: AgentTimeTrackingMember.UserId,
                        operator: ReportingFilterOperator.Equals,
                        values: [String(statsFilters.agents?.values)],
                    },
                ],
                measures: [AgentTimeTrackingMeasure.OnlineTime],
                order: [[AgentTimeTrackingMeasure.OnlineTime, sorting]],
                timezone: timezone,
            })
        })
    })
})
