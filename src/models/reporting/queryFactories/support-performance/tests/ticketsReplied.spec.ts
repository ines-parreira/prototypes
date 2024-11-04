import moment from 'moment'

import {TicketChannel, TicketMessageSourceType} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
    HelpdeskMessageMember,
} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketDimension, TicketMember} from 'models/reporting/cubes/TicketCube'
import {TicketMessagesMember} from 'models/reporting/cubes/TicketMessagesCube'
import {
    ticketsRepliedMetricPerAgentQueryFactory,
    ticketsRepliedMetricPerTicketDrillDownQueryFactory,
    ticketsRepliedQueryFactory,
    ticketsRepliedTimeSeriesQueryFactory,
} from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'models/reporting/types'
import {LegacyStatsFilters, StatsFilters} from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    PublicAndMessageViaFilter,
    TicketDrillDownFilter,
} from 'utils/reporting'

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
            granularity
        )

        expect(query).toEqual({
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
    const statsFilters: LegacyStatsFilters = {
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

    it('should build a query', () => {
        expect(
            ticketsRepliedMetricPerAgentQueryFactory(statsFilters, timezone)
        ).toEqual({
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
                {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.NotEquals,
                    values: [TicketMessageSourceType.InternalNote],
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
                    values: statsFilters.integrations?.map(String),
                },
                {
                    member: TicketMember.Channel,
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
                {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.NotEquals,
                    values: [TicketMessageSourceType.InternalNote],
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
                    values: statsFilters.integrations?.map(String),
                },
                {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.channels,
                },
                {
                    member: TicketMember.MessageSenderId,
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

describe('ticketsRepliedMetricPerTickerQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: LegacyStatsFilters = {
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

    it('should build a query', () => {
        expect(
            ticketsRepliedMetricPerTicketDrillDownQueryFactory(
                statsFilters,
                timezone
            )
        ).toEqual({
            ...ticketsRepliedQueryFactory(statsFilters, timezone),
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketDimension.CreatedDatetime,
                ...ticketsRepliedQueryFactory(statsFilters, timezone)
                    .dimensions,
            ],
            filters: [
                ...ticketsRepliedQueryFactory(statsFilters, timezone).filters,
                TicketDrillDownFilter,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
        })
    })

    it('should build a query with agents filter and sorting', () => {
        const agents = [2]
        const filters = {...statsFilters, agents}

        expect(
            ticketsRepliedMetricPerTicketDrillDownQueryFactory(
                filters,
                timezone,
                sorting
            )
        ).toEqual({
            ...ticketsRepliedQueryFactory(filters, timezone),
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketDimension.CreatedDatetime,
                ...ticketsRepliedQueryFactory(filters, timezone).dimensions,
            ],
            filters: [
                ...ticketsRepliedQueryFactory(filters, timezone).filters,
                TicketDrillDownFilter,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [[TicketDimension.CreatedDatetime, sorting]],
        })
    })
})
