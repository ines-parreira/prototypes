import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment/moment'
import {TicketChannel, TicketMessageSourceType} from 'business/types/ticket'
import {
    closedTicketsPerAgentQueryFactory,
    firstResponseTimeMetricPerAgentQueryFactory,
    ticketsRepliedMetricPerAgentQueryFactory,
    useClosedTicketsMetricPerAgent,
    messagesSentMetricPerAgentQueryFactory,
    useFirstResponseTimeMetricPerAgent,
    useTicketsRepliedMetricPerAgent,
    useMessagesSentMetricPerAgent,
} from 'hooks/reporting/metricsPerDimension'
import {NotSpamNorTrashedTicketsFilter} from 'hooks/reporting/metricTrends'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {
    HelpdeskMessageMeasure,
    HelpdeskMessageMember,
    ReportingFilterOperator,
    TicketDimension,
    TicketMeasure,
    TicketMember,
    TicketSegment,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)

describe('metricsPerDimension', () => {
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
    const agentId = 'someId'

    describe('firstResponseTimeMetricPerAgent', () => {
        it('should build a query', () => {
            expect(
                firstResponseTimeMetricPerAgentQueryFactory(
                    statsFilters,
                    timezone
                )
            ).toEqual({
                dimensions: [TicketDimension.AssigneeUserId],
                filters: [
                    ...NotSpamNorTrashedTicketsFilter,
                    {
                        member: TicketMember.FirstHelpdeskMessageDatetime,
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
                        member: TicketMember.Integration,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.integrations?.map(String),
                    },
                    {
                        member: TicketMember.FirstMessageChannel,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.channels,
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.map(String),
                    },
                ],
                measures: [TicketMeasure.FirstResponseTime],
                segments: [TicketSegment.ConversationStarted],
                timezone: timezone,
            })
        })

        it('should build a query with and agents sorting', () => {
            const agents = [2]

            expect(
                firstResponseTimeMetricPerAgentQueryFactory(
                    {...statsFilters, agents},
                    timezone,
                    sorting
                )
            ).toEqual({
                dimensions: [TicketDimension.AssigneeUserId],
                filters: [
                    ...NotSpamNorTrashedTicketsFilter,
                    {
                        member: TicketMember.FirstHelpdeskMessageDatetime,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [
                            formatReportingQueryDate(periodStart),
                            formatReportingQueryDate(periodEnd),
                        ],
                    },
                    {
                        member: TicketMember.FirstHelpdeskMessageUserId,
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
                        member: TicketMember.Integration,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.integrations?.map(String),
                    },
                    {
                        member: TicketMember.FirstMessageChannel,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.channels,
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.map(String),
                    },
                ],
                measures: [TicketMeasure.FirstResponseTime],
                order: [[TicketMeasure.FirstResponseTime, sorting]],
                segments: [TicketSegment.ConversationStarted],
                timezone: timezone,
            })
        })
    })

    describe('useFirstResponseTimeMetricPerAgent', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useFirstResponseTimeMetricPerAgent(
                        statsFilters,
                        timezone,
                        sorting,
                        agentId
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                firstResponseTimeMetricPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    sorting
                ),
                agentId
            )
        })
    })

    describe('ticketsRepliedMetricPerAgent', () => {
        it('should build a query', () => {
            expect(
                ticketsRepliedMetricPerAgentQueryFactory(statsFilters, timezone)
            ).toEqual({
                dimensions: [TicketDimension.AssigneeUserId],
                filters: [
                    ...NotSpamNorTrashedTicketsFilter,
                    {
                        member: HelpdeskMessageMember.SentDatetime,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [
                            formatReportingQueryDate(periodStart),
                            formatReportingQueryDate(periodEnd),
                        ],
                    },
                    {
                        member: TicketMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [formatReportingQueryDate(periodEnd)],
                    },
                    {
                        member: TicketMember.FirstMessageChannel,
                        operator: ReportingFilterOperator.NotEquals,
                        values: [TicketMessageSourceType.InternalNote],
                    },
                    {
                        member: HelpdeskMessageMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [formatReportingQueryDate(periodStart)],
                    },
                    {
                        member: HelpdeskMessageMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [formatReportingQueryDate(periodEnd)],
                    },

                    {
                        member: TicketMember.Integration,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.integrations?.map(String),
                    },
                    {
                        member: TicketMember.FirstMessageChannel,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.channels,
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.map(String),
                    },
                ],
                measures: [HelpdeskMessageMeasure.TicketCount],
                timezone: timezone,
            })
        })
        it('should build a query with agents and sorting', () => {
            const agents = [2]

            expect(
                ticketsRepliedMetricPerAgentQueryFactory(
                    {...statsFilters, agents},
                    timezone,
                    sorting
                )
            ).toEqual({
                dimensions: [TicketDimension.AssigneeUserId],
                filters: [
                    ...NotSpamNorTrashedTicketsFilter,
                    {
                        member: HelpdeskMessageMember.SentDatetime,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [
                            formatReportingQueryDate(periodStart),
                            formatReportingQueryDate(periodEnd),
                        ],
                    },

                    {
                        member: TicketMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [formatReportingQueryDate(periodEnd)],
                    },
                    {
                        member: TicketMember.FirstMessageChannel,
                        operator: ReportingFilterOperator.NotEquals,
                        values: [TicketMessageSourceType.InternalNote],
                    },
                    {
                        member: HelpdeskMessageMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [formatReportingQueryDate(periodStart)],
                    },
                    {
                        member: HelpdeskMessageMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [formatReportingQueryDate(periodEnd)],
                    },

                    {
                        member: TicketMember.Integration,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.integrations?.map(String),
                    },
                    {
                        member: TicketMember.FirstMessageChannel,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.channels,
                    },
                    {
                        member: HelpdeskMessageMember.SenderId,
                        operator: ReportingFilterOperator.Equals,
                        values: agents?.map(String),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.map(String),
                    },
                ],
                measures: [HelpdeskMessageMeasure.TicketCount],
                order: [[HelpdeskMessageMeasure.TicketCount, sorting]],
                timezone: timezone,
            })
        })
    })

    describe('useFirstResponseTimeMetricPerAgent', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useTicketsRepliedMetricPerAgent(
                        statsFilters,
                        timezone,
                        sorting,
                        agentId
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                ticketsRepliedMetricPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    sorting
                ),
                agentId
            )
        })
    })

    describe('closedTicketsMetricPerAgent', () => {
        it('should build a query', () => {
            expect(
                closedTicketsPerAgentQueryFactory(statsFilters, timezone)
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
                        member: TicketMember.Integration,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.integrations?.map(String),
                    },
                    {
                        member: TicketMember.FirstMessageChannel,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.channels,
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.map(String),
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
                        member: TicketMember.Integration,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.integrations?.map(String),
                    },
                    {
                        member: TicketMember.FirstMessageChannel,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.channels,
                    },
                    {
                        member: TicketMember.AssigneeUserId,
                        operator: ReportingFilterOperator.Equals,
                        values: agents?.map(String),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.map(String),
                    },
                ],
                measures: [TicketMeasure.TicketCount],
                order: [[TicketMeasure.TicketCount, sorting]],
                segments: [TicketSegment.ClosedTickets],
                timezone: timezone,
            })
        })
    })

    describe('usClosedTicketsMetricPerAgent', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useClosedTicketsMetricPerAgent(
                        statsFilters,
                        timezone,
                        sorting,
                        agentId
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                closedTicketsPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    sorting
                ),
                agentId
            )
        })
    })

    describe('messagesSentMetricPerAgentQueryFactory', () => {
        it('should build a query', () => {
            expect(
                messagesSentMetricPerAgentQueryFactory(statsFilters, timezone)
            ).toEqual({
                dimensions: [TicketDimension.AssigneeUserId],
                filters: [
                    {
                        member: TicketMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [formatReportingQueryDate(periodEnd)],
                    },
                    {
                        member: HelpdeskMessageMember.SentDatetime,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [
                            formatReportingQueryDate(periodStart),
                            formatReportingQueryDate(periodEnd),
                        ],
                    },
                    {
                        member: HelpdeskMessageMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [formatReportingQueryDate(periodStart)],
                    },
                    {
                        member: HelpdeskMessageMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [formatReportingQueryDate(periodStart)],
                    },
                    {
                        member: TicketMember.Integration,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.integrations?.map(String),
                    },
                    {
                        member: TicketMember.FirstMessageChannel,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.channels,
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.map(String),
                    },
                ],
                measures: [HelpdeskMessageMeasure.MessageCount],
                timezone: timezone,
            })
        })

        it('should build a query with and agents sorting', () => {
            const agents = [2]

            expect(
                messagesSentMetricPerAgentQueryFactory(
                    {...statsFilters, agents},
                    timezone,
                    sorting
                )
            ).toEqual({
                dimensions: [TicketDimension.AssigneeUserId],
                filters: [
                    {
                        member: TicketMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [formatReportingQueryDate(periodEnd)],
                    },
                    {
                        member: HelpdeskMessageMember.SentDatetime,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [
                            formatReportingQueryDate(periodStart),
                            formatReportingQueryDate(periodEnd),
                        ],
                    },
                    {
                        member: HelpdeskMessageMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [formatReportingQueryDate(periodStart)],
                    },
                    {
                        member: HelpdeskMessageMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [formatReportingQueryDate(periodStart)],
                    },
                    {
                        member: TicketMember.Integration,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.integrations?.map(String),
                    },
                    {
                        member: TicketMember.FirstMessageChannel,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.channels,
                    },
                    {
                        member: HelpdeskMessageMember.SenderId,
                        operator: ReportingFilterOperator.Equals,
                        values: agents.map(String),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.map(String),
                    },
                ],
                measures: [HelpdeskMessageMeasure.MessageCount],
                order: [[HelpdeskMessageMeasure.MessageCount, sorting]],
                timezone: timezone,
            })
        })
    })

    describe('useFirstResponseTimeMetricPerAgent', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useMessagesSentMetricPerAgent(
                        statsFilters,
                        timezone,
                        sorting,
                        agentId
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                messagesSentMetricPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    sorting
                ),
                agentId
            )
        })
    })
})
