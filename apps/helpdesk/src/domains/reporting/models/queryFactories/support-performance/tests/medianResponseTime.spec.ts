import moment from 'moment'

import { TicketChannel } from 'business/types/ticket'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    TicketDimension,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketMessagesEnrichedResponseTimesDimension,
    TicketMessagesEnrichedResponseTimesMeasure,
    TicketMessagesEnrichedResponseTimesMember,
    TicketMessagesEnrichedResponseTimesSegment,
} from 'domains/reporting/models/cubes/TicketMessagesEnrichedResponseTimesCube'
import { CHANNEL_DIMENSION } from 'domains/reporting/models/queryFactories/support-performance/constants'
import {
    medianResponseTimeMetricPerAgentQueryFactory,
    medianResponseTimeMetricPerChannelQueryFactory,
    medianResponseTimeMetricPerTicketDrillDownQueryFactory,
    medianResponseTimeQueryFactory,
} from 'domains/reporting/models/queryFactories/support-performance/medianResponseTime'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { TagFilterInstanceId } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

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
                metricName:
                    METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESPONSE_TIME_PER_AGENT,
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
                        member: TicketMessagesEnrichedResponseTimesMember.Integration,
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
                metricName:
                    METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESPONSE_TIME_PER_AGENT,
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
                        member: TicketMessagesEnrichedResponseTimesMember.Integration,
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
                metricName:
                    METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESPONSE_TIME_PER_CHANNEL,
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
                        member: TicketMessagesEnrichedResponseTimesMember.Integration,
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
                metricName:
                    METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESPONSE_TIME_PER_CHANNEL,
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
                        member: TicketMessagesEnrichedResponseTimesMember.Integration,
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

    describe('medianResponseTimeQueryFactory', () => {
        it('should build a query with stores filter', () => {
            const stores = [1, 2]
            expect(
                medianResponseTimeQueryFactory(
                    {
                        ...statsFilters,
                        stores: withDefaultLogicalOperator(stores),
                    },
                    timezone,
                ),
            ).toEqual(
                expect.objectContaining({
                    filters: expect.arrayContaining([
                        {
                            member: TicketMessagesEnrichedResponseTimesMember.Store,
                            operator: ReportingFilterOperator.Equals,
                            values: stores.map(String),
                        },
                    ]),
                }),
            )
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
                metricName:
                    METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESPONSE_TIME_PER_TICKET_DRILL_DOWN,
                measures: [
                    TicketMessagesEnrichedResponseTimesMeasure.MedianResponseTime,
                ],
                dimensions: [
                    TicketDimension.TicketId,
                    ...medianResponseTimeQueryFactory(statsFilters, timezone)
                        .dimensions,
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
                ...medianResponseTimeQueryFactory(filters, timezone),
                metricName:
                    METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESPONSE_TIME_PER_TICKET_DRILL_DOWN,
                measures: [
                    TicketMessagesEnrichedResponseTimesMeasure.MedianResponseTime,
                ],
                dimensions: [
                    TicketDimension.TicketId,
                    ...medianResponseTimeQueryFactory(statsFilters, timezone)
                        .dimensions,
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
