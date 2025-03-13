import moment from 'moment/moment'

import { TicketChannel } from 'business/types/ticket'
import { OrderDirection } from 'models/api/types'
import {
    AgentTimeTrackingDimension,
    AgentTimeTrackingMeasure,
    AgentTimeTrackingMember,
} from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import {
    onlineTimePerAgentQueryFactory,
    onlineTimeQueryFactory,
} from 'models/reporting/queryFactories/agentxp/onlineTime'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { ReportingFilterOperator } from 'models/reporting/types'
import { StatsFilters, TagFilterInstanceId } from 'models/stat/types'
import { formatReportingQueryDate } from 'utils/reporting'

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
