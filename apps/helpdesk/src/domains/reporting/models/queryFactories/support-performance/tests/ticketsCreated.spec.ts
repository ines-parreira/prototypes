import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    TicketDimension,
    TicketMeasure,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketMessagesMember,
    TicketMessagesSegment,
} from 'domains/reporting/models/cubes/TicketMessagesCube'
import {
    ticketsCreatedPerTicketDrillDownQueryFactory,
    ticketsCreatedQueryFactory,
    ticketsCreatedTimeSeriesQueryFactory,
} from 'domains/reporting/models/queryFactories/support-performance/ticketsCreated'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    TicketDrillDownFilter,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

describe('ticketsCreatedQueryFactory', () => {
    const periodStart = '2021-05-29T00:00:00.000'
    const periodEnd = '2021-06-04T23:59:59.000'
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: periodStart,
            end_datetime: periodEnd,
        },
    }
    const timezone = 'UTC'

    it('should build expected query', () => {
        const query = ticketsCreatedQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED,
            measures: [TicketMeasure.TicketCount],
            dimensions: [],
            filters: [
                {
                    member: TicketMember.CreatedDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [periodStart, periodEnd],
                },
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
            ],
            segments: [],
            timezone,
        })
    })

    it('should build expected query with Agents filter and sorting', () => {
        const agentIds = [1, 2]
        const filters: StatsFilters = {
            period: statsFilters.period,
            agents: withDefaultLogicalOperator(agentIds),
        }
        const sorting = OrderDirection.Asc

        const query = ticketsCreatedQueryFactory(filters, timezone, sorting)

        expect(query).toEqual({
            metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED,
            measures: [TicketMeasure.TicketCount],
            order: [[TicketMeasure.TicketCount, OrderDirection.Asc]],
            dimensions: [],
            filters: [
                {
                    member: TicketMember.CreatedDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [periodStart, periodEnd],
                },

                ...NotSpamNorTrashedTicketsFilter,
                {
                    member: TicketMessagesMember.FirstHelpdeskMessageUserId,
                    operator: ReportingFilterOperator.Equals,
                    values: agentIds.map(String),
                },
                {
                    member: TicketMessagesMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
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
            ],
            segments: [TicketMessagesSegment.TicketCreatedByAgent],
            timezone,
        })
    })

    it('should properly format datetimes', () => {
        const statsFilters: StatsFilters = {
            period: {
                start_datetime: '2021-05-29T00:00:00Z',
                end_datetime: '2021-06-04T23:59:59Z',
            },
            agents: withDefaultLogicalOperator([1, 2]),
        }
        const query = ticketsCreatedQueryFactory(statsFilters, timezone)

        expect(query.filters).toEqual(
            expect.arrayContaining([
                {
                    member: TicketMember.CreatedDatetime,
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
                    member: TicketMessagesMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
            ]),
        )
    })
})

describe('ticketsCreatedTimeSeriesQueryFactory', () => {
    const periodStart = '2021-05-29T00:00:00.000'
    const periodEnd = '2021-06-04T23:59:59.000'
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: periodStart,
            end_datetime: periodEnd,
        },
    }
    const timezone = 'UTC'
    const granularity = ReportingGranularity.Day

    it('should build expected query', () => {
        const query = ticketsCreatedTimeSeriesQueryFactory(
            statsFilters,
            timezone,
            granularity,
        )

        expect(query).toEqual({
            metricName:
                METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED_TIME_SERIES,
            measures: [TicketMeasure.TicketCount],
            order: [[TicketDimension.CreatedDatetime, OrderDirection.Asc]],
            dimensions: [],
            filters: [
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
                ...NotSpamNorTrashedTicketsFilter,
            ],
            segments: [],
            timeDimensions: [
                {
                    dimension: TicketDimension.CreatedDatetime,
                    granularity: ReportingGranularity.Day,
                    dateRange: [periodStart, periodEnd],
                },
            ],
            timezone,
        })
    })

    it('should build expected query with Agents filter', () => {
        const agentIds = [1, 2]
        const filters: StatsFilters = {
            period: statsFilters.period,
            agents: withDefaultLogicalOperator(agentIds),
        }
        const query = ticketsCreatedTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity,
        )

        expect(query).toEqual({
            metricName:
                METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED_TIME_SERIES,
            measures: [TicketMeasure.TicketCount],
            order: [[TicketDimension.CreatedDatetime, OrderDirection.Asc]],
            dimensions: [],
            filters: [
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
                ...NotSpamNorTrashedTicketsFilter,
                {
                    member: TicketMessagesMember.FirstHelpdeskMessageUserId,
                    operator: ReportingFilterOperator.Equals,
                    values: agentIds.map(String),
                },
                {
                    member: TicketMessagesMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
            ],
            segments: [TicketMessagesSegment.TicketCreatedByAgent],
            timeDimensions: [
                {
                    dimension: TicketDimension.CreatedDatetime,
                    granularity: ReportingGranularity.Day,
                    dateRange: [periodStart, periodEnd],
                },
            ],
            timezone,
        })
    })
})

describe('ticketsCreatedPerTicketDrillDownQueryFactory', () => {
    const periodStart = '2021-05-29T00:00:00.000'
    const periodEnd = '2021-06-04T23:59:59.000'
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: periodStart,
            end_datetime: periodEnd,
        },
    }
    const timezone = 'UTC'
    const sorting = OrderDirection.Asc

    it('should build expected query', () => {
        const query = ticketsCreatedPerTicketDrillDownQueryFactory(
            statsFilters,
            timezone,
        )

        expect(query).toEqual({
            ...ticketsCreatedQueryFactory(statsFilters, timezone),
            metricName:
                METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED_PER_TICKET_DRILL_DOWN,
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketDimension.CreatedDatetime,
            ],
            filters: [
                ...ticketsCreatedQueryFactory(statsFilters, timezone).filters,
                TicketDrillDownFilter,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
        })
    })

    it('should build expected query with sorting', () => {
        const query = ticketsCreatedPerTicketDrillDownQueryFactory(
            statsFilters,
            timezone,
            sorting,
        )

        expect(query).toEqual({
            ...ticketsCreatedQueryFactory(statsFilters, timezone),
            metricName:
                METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED_PER_TICKET_DRILL_DOWN,
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketDimension.CreatedDatetime,
            ],
            filters: [
                ...ticketsCreatedQueryFactory(statsFilters, timezone).filters,
                TicketDrillDownFilter,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [[TicketDimension.CreatedDatetime, sorting]],
        })
    })
})
