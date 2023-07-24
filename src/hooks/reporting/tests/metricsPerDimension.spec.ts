import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment/moment'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {TicketChannel} from 'business/types/ticket'
import {
    firstResponseTimeMetricPerAgentQueryFactory,
    useFirstResponseTimeMetricPerAgent,
} from 'hooks/reporting/metricsPerDimension'
import {NotSpamNorTrashedTicketsFilter} from 'hooks/reporting/metricTrends'
import {
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
})
