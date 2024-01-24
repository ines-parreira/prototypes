import moment from 'moment/moment'
import {
    AgentTimeTrackingDimension,
    AgentTimeTrackingMeasure,
    AgentTimeTrackingMember,
} from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import {ReportingFilterOperator} from 'models/reporting/types'
import {TicketChannel} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {
    onlineTimePerAgentQueryFactory,
    onlineTimeQueryFactory,
} from 'models/reporting/queryFactories/agentxp/onlineTime'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate} from 'utils/reporting'

describe('onlineTimePerAgentQueryFactory', () => {
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
                ],
                measures: [AgentTimeTrackingMeasure.OnlineTime],
                timezone: timezone,
            })
        })

        it('should build the query with sorting', () => {
            expect(
                onlineTimeQueryFactory(statsFilters, timezone, sorting)
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
                onlineTimePerAgentQueryFactory(statsFilters, timezone)
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
                ],
                measures: [AgentTimeTrackingMeasure.OnlineTime],
                timezone: timezone,
            })
        })

        it('should build the query with sorting', () => {
            expect(
                onlineTimePerAgentQueryFactory(statsFilters, timezone, sorting)
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
                ],
                measures: [AgentTimeTrackingMeasure.OnlineTime],
                order: [[AgentTimeTrackingMeasure.OnlineTime, sorting]],
                timezone: timezone,
            })
        })
    })
})
