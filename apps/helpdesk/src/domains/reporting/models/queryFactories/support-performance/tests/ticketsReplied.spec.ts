import moment from 'moment'

import { TicketChannel, TicketMessageSourceType } from 'business/types/ticket'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
    HelpdeskMessageMember,
} from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import { TicketMessagesMember } from 'domains/reporting/models/cubes/TicketMessagesCube'
import {
    ticketsRepliedMetricPerAgentQueryFactory,
    ticketsRepliedMetricPerTicketDrillDownQueryFactory,
    ticketsRepliedQueryFactory,
    ticketsRepliedTimeSeriesQueryFactory,
} from 'domains/reporting/models/queryFactories/support-performance/ticketsReplied'
import {
    withDefaultLogicalOperator,
    withLogicalOperator,
} from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { TagFilterInstanceId } from 'domains/reporting/models/stat/types'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    PublicAndMessageViaFilter,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

describe('ticketsRepliedQueryFactory', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    it('should build a query', () => {
        const query = ticketsRepliedQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED,
            dimensions: [],
            measures: [HelpdeskMessageMeasure.TicketCount],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                {
                    member: HelpdeskMessageMember.SentDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [periodStart, periodEnd],
                },
                {
                    member: TicketMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
                {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.NotEquals,
                    values: [TicketMessageSourceType.InternalNote],
                },
                ...PublicAndMessageViaFilter,
                {
                    member: HelpdeskMessageMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: HelpdeskMessageMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
            ],
            timezone,
        })
    })
})

describe('ticketsRepliedQueryFactory with NOT_ONE_OF channel filter', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const timezone = 'someTimeZone'

    it('should append internal-note to the excluded channel values', () => {
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd,
                start_datetime: periodStart,
            },
            channels: withLogicalOperator(
                [TicketChannel.Email, TicketChannel.Chat],
                LogicalOperatorEnum.NOT_ONE_OF,
            ),
        }

        const query = ticketsRepliedQueryFactory(statsFilters, timezone)

        expect(query.filters).toContainEqual({
            member: TicketMember.Channel,
            operator: ReportingFilterOperator.NotEquals,
            values: [
                TicketChannel.Email,
                TicketChannel.Chat,
                TicketMessageSourceType.InternalNote,
            ],
        })
    })
})

describe('ticketsRepliedTimeSeriesQueryFactory', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'
    const granularity = ReportingGranularity.Day

    it('should build a query', () => {
        const query = ticketsRepliedTimeSeriesQueryFactory(
            statsFilters,
            timezone,
            granularity,
        )

        expect(query).toEqual({
            metricName:
                METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED_TIME_SERIES,
            dimensions: [],
            measures: [HelpdeskMessageMeasure.TicketCount],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                {
                    member: HelpdeskMessageMember.SentDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [periodStart, periodEnd],
                },
                {
                    member: TicketMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
                {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.NotEquals,
                    values: [TicketMessageSourceType.InternalNote],
                },
                ...PublicAndMessageViaFilter,
                {
                    member: HelpdeskMessageMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: HelpdeskMessageMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
            ],
            timeDimensions: [
                {
                    dimension: HelpdeskMessageDimension.SentDatetime,
                    granularity,
                    dateRange: getFilterDateRange(statsFilters.period),
                },
            ],
            timezone,
        })
    })
})

describe('ticketsRepliedMetricPerAgent', () => {
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

    it('should build a query', () => {
        expect(
            ticketsRepliedMetricPerAgentQueryFactory(statsFilters, timezone),
        ).toEqual({
            metricName:
                METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED_PER_AGENT,
            dimensions: [TicketDimension.MessageSenderId],
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
                    member: TicketMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [formatReportingQueryDate(periodStart)],
                },
                {
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [formatReportingQueryDate(periodEnd)],
                },
                ...PublicAndMessageViaFilter,
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
            measures: [HelpdeskMessageMeasure.TicketCount],
            timezone: timezone,
        })
    })

    it('should build a query with agents and sorting', () => {
        const agents = withDefaultLogicalOperator([2])

        expect(
            ticketsRepliedMetricPerAgentQueryFactory(
                { ...statsFilters, agents },
                timezone,
                sorting,
            ),
        ).toEqual({
            metricName:
                METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED_PER_AGENT,
            dimensions: [TicketDimension.MessageSenderId],
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
                    member: TicketMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [formatReportingQueryDate(periodStart)],
                },
                {
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [formatReportingQueryDate(periodEnd)],
                },
                ...PublicAndMessageViaFilter,
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
                    member: TicketMember.MessageSenderId,
                    operator: ReportingFilterOperator.Equals,
                    values: agents?.values.map(String),
                },
                {
                    member: TicketMember.Tags,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.tags?.[0]?.values.map(String),
                },
            ],
            measures: [HelpdeskMessageMeasure.TicketCount],
            order: [[HelpdeskMessageMeasure.TicketCount, sorting]],
            timezone: timezone,
        })
    })
})

describe('ticketsRepliedMetricPerTickerQueryFactory', () => {
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

    it('should build a query', () => {
        expect(
            ticketsRepliedMetricPerTicketDrillDownQueryFactory(
                statsFilters,
                timezone,
            ),
        ).toEqual({
            ...ticketsRepliedQueryFactory(statsFilters, timezone),
            metricName:
                METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED_PER_TICKET_DRILL_DOWN,
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketDimension.CreatedDatetime,
                ...ticketsRepliedQueryFactory(statsFilters, timezone)
                    .dimensions,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
        })
    })

    it('should build a query with agents filter and sorting', () => {
        const agents = withDefaultLogicalOperator([2])
        const filters = { ...statsFilters, agents }

        expect(
            ticketsRepliedMetricPerTicketDrillDownQueryFactory(
                filters,
                timezone,
                sorting,
            ),
        ).toEqual({
            ...ticketsRepliedQueryFactory(filters, timezone),
            metricName:
                METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED_PER_TICKET_DRILL_DOWN,
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketDimension.CreatedDatetime,
                ...ticketsRepliedQueryFactory(filters, timezone).dimensions,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [[TicketDimension.CreatedDatetime, sorting]],
        })
    })
})
