import {OrderDirection} from 'models/api/types'
import {
    TicketDimension,
    TicketMeasure,
    TicketMember,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketMessagesMember,
    TicketMessagesSegment,
} from 'models/reporting/cubes/TicketMessagesCube'
import {
    ticketsCreatedPerTicketQueryFactory,
    ticketsCreatedQueryFactory,
    ticketsCreatedTimeSeriesQueryFactory,
} from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    NotSpamNorTrashedTicketsFilter,
    TicketDrillDownFilter,
} from 'utils/reporting'

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
    const granularity = ReportingGranularity.Day

    it('should build expected query', () => {
        const query = ticketsCreatedTimeSeriesQueryFactory(
            statsFilters,
            timezone,
            granularity
        )

        expect(query).toEqual({
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
        const filters = {
            ...statsFilters,
            agents: agentIds,
        }
        const query = ticketsCreatedTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity
        )

        expect(query).toEqual({
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

describe('ticketsCreatedPerTicketQueryFactory', () => {
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
        const query = ticketsCreatedPerTicketQueryFactory(
            statsFilters,
            timezone
        )

        expect(query).toEqual({
            ...ticketsCreatedQueryFactory(statsFilters, timezone),
            measures: [],
            dimensions: [TicketDimension.TicketId],
            filters: [
                ...ticketsCreatedQueryFactory(statsFilters, timezone).filters,
                TicketDrillDownFilter,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
        })
    })

    it('should build expected query with sorting', () => {
        const query = ticketsCreatedPerTicketQueryFactory(
            statsFilters,
            timezone,
            sorting
        )

        expect(query).toEqual({
            ...ticketsCreatedQueryFactory(statsFilters, timezone),
            measures: [],
            dimensions: [TicketDimension.TicketId],
            filters: [
                ...ticketsCreatedQueryFactory(statsFilters, timezone).filters,
                TicketDrillDownFilter,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [[TicketMeasure.TicketCount, sorting]],
        })
    })
})
