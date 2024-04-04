import moment from 'moment/moment'
import {TicketChannel} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {HandleTimeMeasure} from 'models/reporting/cubes/agentxp/HandleTimeCube'
import {
    TicketDimension,
    TicketMember,
    TicketSegment,
} from 'models/reporting/cubes/TicketCube'
import {TicketMessagesMember} from 'models/reporting/cubes/TicketMessagesCube'
import {
    ticketAverageHandleTimePerAgentQueryFactory,
    ticketHandleTimePerTicketQueryFactory,
    ticketAverageHandleTimeQueryFactory,
} from 'models/reporting/queryFactories/agentxp/ticketHandleTime'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    TicketDrillDownFilter,
} from 'utils/reporting'

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
        agents: [1],
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc

    describe('ticketHandleTimeQueryFactory', () => {
        it('should build the query', () => {
            expect(
                ticketAverageHandleTimeQueryFactory(statsFilters, timezone)
            ).toEqual({
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
                        values: statsFilters.integrations?.map((i) =>
                            String(i)
                        ),
                    },
                    {
                        member: TicketMember.Channel,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.channels,
                    },
                    {
                        member: TicketMember.AssigneeUserId,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.agents?.map((i) => String(i)),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.map((i) => String(i)),
                    },
                ],
                measures: [HandleTimeMeasure.AverageHandleTime],
                segments: ['TicketEnriched.closedTickets'],
                timezone: timezone,
            })
        })

        it('should build the query with sorting', () => {
            expect(
                ticketAverageHandleTimeQueryFactory(
                    statsFilters,
                    timezone,
                    sorting
                )
            ).toEqual({
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
                        values: statsFilters.integrations?.map((i) =>
                            String(i)
                        ),
                    },
                    {
                        member: TicketMember.Channel,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.channels?.map((i) => String(i)),
                    },
                    {
                        member: TicketMember.AssigneeUserId,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.agents?.map((i) => String(i)),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.map((i) => String(i)),
                    },
                ],
                measures: [HandleTimeMeasure.AverageHandleTime],
                order: [[HandleTimeMeasure.AverageHandleTime, sorting]],
                segments: ['TicketEnriched.closedTickets'],
                timezone: timezone,
            })
        })
    })

    describe('ticketHandleTimePerTicketQueryFactory', () => {
        it('should build the query', () => {
            expect(
                ticketHandleTimePerTicketQueryFactory(statsFilters, timezone)
            ).toEqual({
                dimensions: [TicketDimension.TicketId],
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
                        values: statsFilters.integrations?.map((i) =>
                            String(i)
                        ),
                    },
                    {
                        member: TicketMember.Channel,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.channels?.map((i) => String(i)),
                    },
                    {
                        member: TicketMember.AssigneeUserId,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.agents?.map((i) => String(i)),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.map((i) => String(i)),
                    },
                    TicketDrillDownFilter,
                ],
                limit: DRILLDOWN_QUERY_LIMIT,
                measures: [HandleTimeMeasure.HandleTime],
                segments: [TicketSegment.ClosedTickets],
                timezone: timezone,
            })
        })

        it('should build the query with sorting', () => {
            expect(
                ticketHandleTimePerTicketQueryFactory(
                    statsFilters,
                    timezone,
                    sorting
                )
            ).toEqual({
                dimensions: [TicketDimension.TicketId],
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
                        values: statsFilters.integrations?.map((i) =>
                            String(i)
                        ),
                    },
                    {
                        member: TicketMember.Channel,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.channels?.map((i) => String(i)),
                    },
                    {
                        member: TicketMember.AssigneeUserId,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.agents?.map((i) => String(i)),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.map((i) => String(i)),
                    },
                    TicketDrillDownFilter,
                ],
                limit: DRILLDOWN_QUERY_LIMIT,
                measures: [HandleTimeMeasure.HandleTime],
                order: [[HandleTimeMeasure.HandleTime, sorting]],
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
                    timezone
                )
            ).toEqual({
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
                        values: statsFilters.integrations?.map((i) =>
                            String(i)
                        ),
                    },
                    {
                        member: TicketMember.Channel,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.channels?.map((i) => String(i)),
                    },
                    {
                        member: TicketMember.AssigneeUserId,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.agents?.map((i) => String(i)),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.map((i) => String(i)),
                    },
                    TicketDrillDownFilter,
                ],
                limit: DRILLDOWN_QUERY_LIMIT,
                measures: [HandleTimeMeasure.AverageHandleTime],
                segments: ['TicketEnriched.closedTickets'],
                timezone: timezone,
            })
        })

        it('should build the query with sorting', () => {
            expect(
                ticketAverageHandleTimePerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    sorting
                )
            ).toEqual({
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
                        values: statsFilters.integrations?.map((i) =>
                            String(i)
                        ),
                    },
                    {
                        member: TicketMember.Channel,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.channels?.map((i) => String(i)),
                    },
                    {
                        member: TicketMember.AssigneeUserId,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.agents?.map((i) => String(i)),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.map((i) => String(i)),
                    },
                    TicketDrillDownFilter,
                ],
                limit: DRILLDOWN_QUERY_LIMIT,
                measures: [HandleTimeMeasure.AverageHandleTime],
                order: [[HandleTimeMeasure.AverageHandleTime, sorting]],
                segments: ['TicketEnriched.closedTickets'],
                timezone: timezone,
            })
        })
    })
})
