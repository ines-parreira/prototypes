import moment from 'moment'

import {TicketChannel} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
    HelpdeskMessageMember,
} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketDimension, TicketMember} from 'models/reporting/cubes/TicketCube'
import {
    messagesSentMetricPerAgentQueryFactory,
    messagesSentMetricPerTicketDrillDownQueryFactory,
    messagesSentQueryFactory,
    messagesSentTimeSeriesQueryFactory,
} from 'models/reporting/queryFactories/support-performance/messagesSent'
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

describe('messagesSentQueryFactory', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    it('should create a query', () => {
        const query = messagesSentQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            measures: [HelpdeskMessageMeasure.MessageCount],
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
                {
                    member: HelpdeskMessageMember.SentDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [periodStart, periodEnd],
                },
                ...NotSpamNorTrashedTicketsFilter,
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

describe('messagesSentTimeSeriesQueryFactory', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const granularity = ReportingGranularity.Day
    const timezone = 'someTimeZone'

    it('should create a query', () => {
        const query = messagesSentTimeSeriesQueryFactory(
            statsFilters,
            timezone,
            granularity
        )

        expect(query).toEqual({
            measures: [HelpdeskMessageMeasure.MessageCount],
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
                {
                    member: HelpdeskMessageMember.SentDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [periodStart, periodEnd],
                },
                ...NotSpamNorTrashedTicketsFilter,
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

describe('messagesSentMetricPerAgentQueryFactory', () => {
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
            messagesSentMetricPerAgentQueryFactory(statsFilters, timezone)
        ).toEqual({
            ...messagesSentQueryFactory(statsFilters, timezone),
            dimensions: [HelpdeskMessageDimension.SenderId],
        })
    })

    it('should build a query with and agents sorting', () => {
        const agents = [2]
        const filters = {...statsFilters, agents}
        expect(
            messagesSentMetricPerAgentQueryFactory(filters, timezone, sorting)
        ).toEqual({
            ...messagesSentQueryFactory(filters, timezone),
            dimensions: [HelpdeskMessageDimension.SenderId],
            order: [[HelpdeskMessageMeasure.MessageCount, sorting]],
        })
    })
})

describe('messagesSentMetricPerTicketQueryFactory', () => {
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
            messagesSentMetricPerTicketDrillDownQueryFactory(
                statsFilters,
                timezone
            )
        ).toEqual({
            ...messagesSentQueryFactory(statsFilters, timezone),
            measures: [HelpdeskMessageMeasure.MessageCount],
            dimensions: [
                TicketDimension.TicketId,
                ...messagesSentQueryFactory(statsFilters, timezone).dimensions,
            ],
            filters: [
                ...messagesSentQueryFactory(statsFilters, timezone).filters,
                TicketDrillDownFilter,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
        })
    })

    it('should build a query with agents filter and sorting', () => {
        const agents = [2]
        const filters = {...statsFilters, agents}

        expect(
            messagesSentMetricPerTicketDrillDownQueryFactory(
                filters,
                timezone,
                sorting
            )
        ).toEqual({
            ...messagesSentMetricPerAgentQueryFactory(filters, timezone),
            measures: [HelpdeskMessageMeasure.MessageCount],
            dimensions: [
                TicketDimension.TicketId,
                ...messagesSentMetricPerAgentQueryFactory(filters, timezone)
                    .dimensions,
            ],
            filters: [
                ...messagesSentMetricPerAgentQueryFactory(filters, timezone)
                    .filters,
                TicketDrillDownFilter,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [[HelpdeskMessageMeasure.MessageCount, sorting]],
        })
    })
})
