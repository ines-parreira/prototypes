import moment from 'moment'

import { TicketChannel } from 'business/types/ticket'
import { OrderDirection } from 'models/api/types'
import {
    TicketDimension,
    TicketMember,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
    TicketMessagesMember,
} from 'models/reporting/cubes/TicketMessagesCube'
import {
    averageResponseTimeMetricPerAgentQueryFactory,
    averageResponseTimeMetricPerChannelQueryFactory,
    averageResponseTimeMetricPerTicketDrillDownQueryFactory,
    averageResponseTimeQueryFactory,
} from 'models/reporting/queryFactories/support-performance/averageResponseTime'
import { CHANNEL_DIMENSION } from 'models/reporting/queryFactories/support-performance/constants'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { ReportingFilterOperator } from 'models/reporting/types'
import { StatsFilters, TagFilterInstanceId } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    TicketDrillDownFilter,
} from 'utils/reporting'

describe('averageResponseTime', () => {
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

    describe('averageResponseTimeMetricPerAgent', () => {
        it('should build a query', () => {
            expect(
                averageResponseTimeMetricPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                ),
            ).toEqual({
                dimensions: [TicketMessagesDimension.SenderId],
                filters: [
                    ...NotSpamNorTrashedTicketsFilter,
                    {
                        member: TicketMessagesMember.SentDatetime,
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
                measures: [TicketMessagesMeasure.AverageResponseTime],
                segments: [],
                timezone: timezone,
            })
        })

        it('should build a query with and agents sorting', () => {
            const agents = [2]

            expect(
                averageResponseTimeMetricPerAgentQueryFactory(
                    {
                        ...statsFilters,
                        agents: withDefaultLogicalOperator(agents),
                    },
                    timezone,
                    sorting,
                ),
            ).toEqual({
                dimensions: [TicketMessagesDimension.SenderId],
                filters: [
                    ...NotSpamNorTrashedTicketsFilter,
                    {
                        member: TicketMessagesMember.SentDatetime,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [
                            formatReportingQueryDate(periodStart),
                            formatReportingQueryDate(periodEnd),
                        ],
                    },
                    {
                        member: TicketMessagesMember.SenderId,
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
                measures: [TicketMessagesMeasure.AverageResponseTime],
                order: [[TicketMessagesMeasure.AverageResponseTime, sorting]],
                segments: [],
                timezone: timezone,
            })
        })
    })

    describe('averageResponseTimeMetricPerChannel', () => {
        it('should build a query', () => {
            expect(
                averageResponseTimeMetricPerChannelQueryFactory(
                    statsFilters,
                    timezone,
                ),
            ).toEqual({
                dimensions: [CHANNEL_DIMENSION],
                filters: [
                    ...NotSpamNorTrashedTicketsFilter,
                    {
                        member: TicketMessagesMember.SentDatetime,
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
                measures: [TicketMessagesMeasure.AverageResponseTime],
                segments: [],
                timezone: timezone,
            })
        })

        it('should build a query with and agents sorting', () => {
            const agents = [2]

            expect(
                averageResponseTimeMetricPerChannelQueryFactory(
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
                        member: TicketMessagesMember.SentDatetime,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [
                            formatReportingQueryDate(periodStart),
                            formatReportingQueryDate(periodEnd),
                        ],
                    },
                    {
                        member: TicketMessagesMember.SenderId,
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
                measures: [TicketMessagesMeasure.AverageResponseTime],
                order: [[TicketMessagesMeasure.AverageResponseTime, sorting]],
                segments: [],
                timezone: timezone,
            })
        })
    })

    describe('averageResponseTimeMetricPerTicketQueryFactory', () => {
        it('should build a query', () => {
            expect(
                averageResponseTimeMetricPerTicketDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                ),
            ).toEqual({
                ...averageResponseTimeQueryFactory(statsFilters, timezone),
                measures: [],
                dimensions: [
                    TicketDimension.TicketId,
                    ...averageResponseTimeMetricPerAgentQueryFactory(
                        statsFilters,
                        timezone,
                    ).dimensions,
                ],
                filters: [
                    ...averageResponseTimeMetricPerAgentQueryFactory(
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
                averageResponseTimeMetricPerTicketDrillDownQueryFactory(
                    filters,
                    timezone,
                    sorting,
                ),
            ).toEqual({
                ...averageResponseTimeMetricPerAgentQueryFactory(
                    filters,
                    timezone,
                ),
                measures: [],
                dimensions: [
                    TicketDimension.TicketId,
                    ...averageResponseTimeMetricPerAgentQueryFactory(
                        statsFilters,
                        timezone,
                    ).dimensions,
                ],
                filters: [
                    ...averageResponseTimeMetricPerAgentQueryFactory(
                        filters,
                        timezone,
                    ).filters,
                    TicketDrillDownFilter,
                ],
                limit: DRILLDOWN_QUERY_LIMIT,
                order: [[TicketMessagesMeasure.AverageResponseTime, sorting]],
            })
        })
    })
})
