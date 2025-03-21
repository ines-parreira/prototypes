import moment from 'moment'

import { TicketChannel } from 'business/types/ticket'
import { OrderDirection } from 'models/api/types'
import {
    TicketDimension,
    TicketMember,
} from 'models/reporting/cubes/TicketCube'
import { TicketMessagesMember } from 'models/reporting/cubes/TicketMessagesCube'
import {
    TicketMessagesEnrichedResponseTimesDimension,
    TicketMessagesEnrichedResponseTimesMeasure,
    TicketMessagesEnrichedResponseTimesMember,
    TicketMessagesEnrichedResponseTimesSegment,
} from 'models/reporting/cubes/TicketMessagesEnrichedResponseTimesCube'
import { CHANNEL_DIMENSION } from 'models/reporting/queryFactories/support-performance/constants'
import {
    medianResponseTimeMetricPerAgentQueryFactory,
    medianResponseTimeMetricPerChannelQueryFactory,
    medianResponseTimeMetricPerTicketDrillDownQueryFactory,
    medianResponseTimeQueryFactory,
} from 'models/reporting/queryFactories/support-performance/medianResponseTime'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { ReportingFilterOperator } from 'models/reporting/types'
import { StatsFilters, TagFilterInstanceId } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    TicketDrillDownFilter,
} from 'utils/reporting'

describe('medianResponseTime', () => {
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

    describe('medianResponseTimeMetricPerAgent', () => {
        it('should build a query', () => {
            expect(
                medianResponseTimeMetricPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                ),
            ).toEqual({
                dimensions: [
                    TicketMessagesEnrichedResponseTimesDimension.TicketMessageUserId,
                ],
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
                        values: statsFilters.channels?.values.map(String),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.[0]?.values.map(String),
                    },
                ],
                measures: [
                    TicketMessagesEnrichedResponseTimesMeasure.MedianResponseTime,
                ],
                segments: [
                    TicketMessagesEnrichedResponseTimesSegment.ConversationStarted,
                ],
                timezone: timezone,
            })
        })

        it('should build a query with and agents sorting', () => {
            const agents = [2]

            expect(
                medianResponseTimeMetricPerAgentQueryFactory(
                    {
                        ...statsFilters,
                        agents: withDefaultLogicalOperator(agents),
                    },
                    timezone,
                    sorting,
                ),
            ).toEqual({
                dimensions: [
                    TicketMessagesEnrichedResponseTimesDimension.TicketMessageUserId,
                ],
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
                        member: TicketMessagesEnrichedResponseTimesMember.TicketMessageUserId,
                        operator: ReportingFilterOperator.Equals,
                        values: agents?.map(String),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.[0]?.values.map(String),
                    },
                ],
                measures: [
                    TicketMessagesEnrichedResponseTimesMeasure.MedianResponseTime,
                ],
                order: [
                    [
                        TicketMessagesEnrichedResponseTimesMeasure.MedianResponseTime,
                        sorting,
                    ],
                ],
                segments: [
                    TicketMessagesEnrichedResponseTimesSegment.ConversationStarted,
                ],
                timezone: timezone,
            })
        })
    })

    describe('medianResponseTimeMetricPerChannel', () => {
        it('should build a query', () => {
            expect(
                medianResponseTimeMetricPerChannelQueryFactory(
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
                measures: [
                    TicketMessagesEnrichedResponseTimesMeasure.MedianResponseTime,
                ],
                segments: [
                    TicketMessagesEnrichedResponseTimesSegment.ConversationStarted,
                ],
                timezone: timezone,
            })
        })

        it('should build a query with and agents sorting', () => {
            const agents = [2]

            expect(
                medianResponseTimeMetricPerChannelQueryFactory(
                    {
                        ...statsFilters,
                        agents: withDefaultLogicalOperator(agents),
                    },
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
                        member: TicketMessagesEnrichedResponseTimesMember.TicketMessageUserId,
                        operator: ReportingFilterOperator.Equals,
                        values: agents?.map(String),
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: statsFilters.tags?.[0]?.values.map(String),
                    },
                ],
                measures: [
                    TicketMessagesEnrichedResponseTimesMeasure.MedianResponseTime,
                ],
                order: [
                    [
                        TicketMessagesEnrichedResponseTimesMeasure.MedianResponseTime,
                        sorting,
                    ],
                ],
                segments: [
                    TicketMessagesEnrichedResponseTimesSegment.ConversationStarted,
                ],
                timezone: timezone,
            })
        })
    })

    describe('medianResponseTimeMetricPerTicketQueryFactory', () => {
        it('should build a query', () => {
            expect(
                medianResponseTimeMetricPerTicketDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                ),
            ).toEqual({
                ...medianResponseTimeQueryFactory(statsFilters, timezone),
                measures: [
                    TicketMessagesEnrichedResponseTimesMeasure.MedianResponseTime,
                ],
                dimensions: [
                    TicketDimension.TicketId,
                    ...medianResponseTimeMetricPerAgentQueryFactory(
                        statsFilters,
                        timezone,
                    ).dimensions,
                ],
                filters: [
                    ...medianResponseTimeMetricPerAgentQueryFactory(
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
                medianResponseTimeMetricPerTicketDrillDownQueryFactory(
                    filters,
                    timezone,
                    sorting,
                ),
            ).toEqual({
                ...medianResponseTimeMetricPerAgentQueryFactory(
                    filters,
                    timezone,
                ),
                measures: [
                    TicketMessagesEnrichedResponseTimesMeasure.MedianResponseTime,
                ],
                dimensions: [
                    TicketDimension.TicketId,
                    ...medianResponseTimeMetricPerAgentQueryFactory(
                        statsFilters,
                        timezone,
                    ).dimensions,
                ],
                filters: [
                    ...medianResponseTimeMetricPerAgentQueryFactory(
                        filters,
                        timezone,
                    ).filters,
                    TicketDrillDownFilter,
                ],
                limit: DRILLDOWN_QUERY_LIMIT,
                order: [
                    [
                        TicketMessagesEnrichedResponseTimesMeasure.MedianResponseTime,
                        sorting,
                    ],
                ],
            })
        })
    })
})
